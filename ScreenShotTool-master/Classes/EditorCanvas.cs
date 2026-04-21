using ScreenShotTool.Forms;
using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Runtime.Versioning;
using static ScreenShotTool.Forms.ScreenshotEditor;

namespace ScreenShotTool;
[SupportedOSPlatform("windows")]
public class EditorCanvas(ScreenshotEditor parent, PictureBox pictureBox)
{
    readonly ScreenshotEditor parentEditor = parent;
    readonly PictureBox pictureBox = pictureBox;
    public Bitmap? SourceImage;
    Image? OverlayImage;
    //Bitmap? blurImage;
    Graphics? overlayGraphics;
    public int ArrowWeight = 5;
    public int LineWeight = 2;
    readonly int frameRate = Settings.Default.MaxFramerate;
    Point MousePositionLocal = Point.Empty;

    public int BlurRadius = Settings.Default.BlurSampleArea;
    public int MosaicSize = Settings.Default.BlurMosaicSize;
    //public bool InitialBlurComplete = false; // used to prevent blur from generating twice, when numeric is set initially

    public int OutOfBoundsMaxPixels = 1000;
    public Size CanvasSize = new(100, 100); // will be updated when the image loads
    public Rectangle CanvasRect
    {
        get
        {
            return new Rectangle(0, 0, CanvasSize.Width, CanvasSize.Height);
        }
    }

    public GraphicSymbol? CurrentSelectedSymbol
    {
        get
        {
            GraphicSymbol? symbol = parentEditor.GetSelectedSymbolFirst();
            if (symbol != null)
                return symbol;
            else
                return null;
        }
    }

    public void UpdateSourceImage(Bitmap bitmap)
    {
        SourceImage = bitmap;
    }

    public List<GraphicSymbol> Symbols
    {
        get
        {
            List<GraphicSymbol> gsList = [];
            foreach (ListViewItem lvi in parentEditor.GetSymbolListView().Items)
            {
                if (lvi.Tag is GraphicSymbol gs)
                {
                    gsList.Add(gs);
                }
            }
            return gsList;
        }
    }

    #region Create and destroy --------------------------------------------------------------------------

    public void FlushImages(bool deleteSymbols = false)
    {
        // used at the end of each Load/Create image
        overlayGraphics.DisposeAndNull();
        OverlayImage.DisposeAndNull();
        //blurImage.DisposeAndNull();
        if (deleteSymbols)
        {
            DeleteAllSymbols();
        }
    }

    public void DeleteAllSymbols()
    {
        parentEditor.DeleteListViewSymbols();
        UpdateOverlay();
    }

    #endregion

    #region Load and Save -------------------------------------------------------------------------------

    internal void CreateNewImage(int Width, int Height, Color color)
    {
        SourceImage.DisposeAndNull();
        SourceImage = new Bitmap(Width, Height, PixelFormat.Format32bppArgb);
        UpdateCanvasSize(SourceImage.Size);
        Graphics g = Graphics.FromImage(SourceImage);
        g.FillRectangle(new SolidBrush(color), 0, 0, Width, Height);
        FlushImages(true);
        CreateOverlay(pictureBox);
        UpdateOverlay();
    }

    public void LoadImageFromClipboard()
    {
        try
        {
            SourceImage.DisposeAndNull();
            SourceImage = ImageProcessing.ImageToBitmap32bppArgb(Clipboard.GetImage(), true); //(Bitmap)Clipboard.GetImage(); 
            if (SourceImage != null)
            {
                UpdateCanvasSize(SourceImage.Size);
            }
            else
            {
                Debug.WriteLine("Couldn't load image from clipboard");
                MessageBox.Show("Couldn't load image from clipboard.\nUsing blank image.");
                CreateNewImage(640, 480, Color.White);
            }
        }
        catch
        {
            Debug.WriteLine("Could not load from clipboard");
            return;
        }
        FlushImages(true);
        CreateOverlay(pictureBox);
        UpdateOverlay();
    }

    public void LoadImageFromImage(Image image, bool deleteAllSymbols)
    {
        SourceImage.DisposeAndNull();
        SourceImage = ImageProcessing.ImageToBitmap32bppArgb(image, true);
        if (SourceImage != null)
        {
            UpdateCanvasSize(SourceImage.Size);
        }
        else
        {
            Debug.WriteLine("Couldn't load image from other image object");
            MessageBox.Show("Error: Couldn't load image.\nUsing blank image.");
            CreateNewImage(640, 480, Color.White);
        }
        FlushImages(deleteAllSymbols);
        CreateOverlay(pictureBox);
        UpdateOverlay();
    }

    public void LoadImageFromFile(string filename)
    {
        if (File.Exists(filename))
        {
            Debug.WriteLine("Loading file: " + filename);

            try
            {
                // Using and closing filestream, so the file isn't reserved by the process

                Image? tempImage = null;
                using (FileStream stream = new(filename, FileMode.Open))
                {
                    tempImage = Image.FromStream(stream);
                }
                SourceImage.DisposeAndNull();
                SourceImage = ImageProcessing.ImageToBitmap32bppArgb(tempImage, true);
                if (SourceImage != null)
                {
                    UpdateCanvasSize(SourceImage.Size);
                }
            }
            catch
            {
                Debug.WriteLine("Could not load file");

            }
            FlushImages(true);
            CreateOverlay(pictureBox);
            UpdateOverlay();
        }
    }

    // no longer in use, GetImageInProgress is better
    //public Bitmap? AssembleImageForSaveOrCopy() 
    //{
    //    UpdateOverlay(highlightSelected: false);
    //    if (SourceImage == null) return null;
    //    Bitmap outImage = new(SourceImage);
    //    Graphics saveGraphic = Graphics.FromImage(outImage);
    //    saveGraphic.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
    //    saveGraphic.TextRenderingHint = TextRenderingHint.AntiAlias;
    //    imageInProgress = new(SourceImage); // clears the image so higlights etc aren't drawn twice, applying double blend mode
    //    DrawElements(saveGraphic, ShowNonOutputWidgets: false);
    //    saveGraphic.Dispose();
    //    return outImage;
    //}

    public Bitmap? GetImageInProgress()
    {
        UpdateOverlay(highlightSelected: false);
        if (imageInProgress == null) return null;
        return new Bitmap(imageInProgress);
    }

    #endregion

    #region Create and Update overlay -------------------------------------------------------------------

    private void UpdateCanvasSize(Size size)
    {
        CanvasSize = size;
        parentEditor.UpdateNumericLimits();
    }

    private void CreateOverlay(PictureBox pictureBox)
    {
        if (SourceImage != null)
        {
            OverlayImage?.Dispose();
            overlayGraphics?.Dispose();
            OverlayImage = new Bitmap(SourceImage.Width, SourceImage.Height);
            overlayGraphics = Graphics.FromImage(OverlayImage);
            overlayGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            overlayGraphics.TextRenderingHint = TextRenderingHint.AntiAlias; // fixes ugly aliasing on text

            pictureBox.Image = OverlayImage;
            pictureBox.Width = SourceImage.Width;
            pictureBox.Height = SourceImage.Height;
        }
        else
        {
            //Debug.WriteLine("Create overlay failed, original image is null");
        }
    }


    DateTime LastFrame = DateTime.Now;
    int skippedUpdates = 0;
    public bool UpdateOverlay(GraphicSymbol? temporarySymbol = null, bool forceUpdate = true, bool highlightSelected = true)
    {
        //Stopwatch sw = Stopwatch.StartNew();
        float MilliSecondsPerFrame = (1f / frameRate) * 1000;
        TimeSpan ts = DateTime.Now - LastFrame;
        if (ts.Milliseconds < MilliSecondsPerFrame && forceUpdate == false)
        {
            skippedUpdates++;
            return false;
        }

        if (OverlayImage == null || overlayGraphics == null)
        {
            CreateOverlay(pictureBox);
        }
        if (OverlayImage != null && overlayGraphics != null)
        {
            pictureBox.Image.Dispose();
            pictureBox.Image = DrawOverlay(temporarySymbol, highlightSelected); ;
        }
        //sw.Stop();
        //Debug.WriteLine($"MS since last frame: {ts.Milliseconds}");
        LastFrame = DateTime.Now;
        return true;
    }

    Bitmap? imageInProgress;
    private Bitmap DrawOverlay(GraphicSymbol? temporarySymbol = null, bool highlightSelected = true)
    {
        imageInProgress.DisposeAndNull();
        //Bitmap img;
        if (SourceImage != null)
        {
            imageInProgress = ImageProcessing.CopyImage(SourceImage);
        }
        else
        {
            Debug.WriteLine("Couldn't create correct overlay image, originalImage is null");
            imageInProgress = new Bitmap(100, 100);
        }
        overlayGraphics.DisposeAndNull();

        overlayGraphics = Graphics.FromImage(imageInProgress);

        overlayGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        overlayGraphics.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;

        DrawElements(overlayGraphics, temporarySymbol, ShowNonOutputWidgets: highlightSelected);

        return imageInProgress;
    }

    private void DrawElements(Graphics graphic, GraphicSymbol? temporarySymbol = null, bool ShowNonOutputWidgets = false)
    {
        int NumberedSymbolCounter = 1;
        if (SourceImage == null) return;
        foreach (GraphicSymbol symbol in Symbols)
        {
            if (ShowNonOutputWidgets == false && symbol is GsCrop) // don't show Crop in renders where no highlighting should be visible, like save or copy
            {
                continue;
            }
            if (symbol is GsDynamicImage gsDn)
            {
                if (gsDn is GsBlur gsBlur)
                {
                    gsBlur.SourceImage.DisposeAndNull();
                    gsBlur.SourceImage = ImageProcessing.CreateBlurImage(imageInProgress, gsBlur.MosaicSize, gsBlur.Bounds, gsBlur.BlurRadius);
                    //InitialBlurComplete = true;
                }
                else
                {
                    gsDn.SourceImage = imageInProgress;
                }
            }
            if (symbol is GsNumbered gsNumbered)
            {
                if (gsNumbered.AutoNumber)
                {
                    //gsNumbered.Number = NumberedSymbolCounter;
                    gsNumbered.Text = NumberedSymbolCounter.ToString();
                    NumberedSymbolCounter++;
                }
            }
            symbol.ContainerBounds = new Rectangle(0, 0, SourceImage.Width, SourceImage.Height); // used by Border symbol
            symbol.DrawSymbol(graphic);
        }
        if (temporarySymbol != null)
        {
            if (temporarySymbol is GsNumbered gsNumbered)
            {
                //gsNumbered.Number = NumberedSymbolCounter;
                gsNumbered.Text = NumberedSymbolCounter.ToString();
            }
            if (temporarySymbol is GsDynamicImage gsDynamicImage)
            {
                if (gsDynamicImage is GsBlur gsBlur)
                {
                    gsBlur.SourceImage.DisposeAndNull();
                    gsBlur.SourceImage = ImageProcessing.CreateBlurImage(imageInProgress, gsBlur.MosaicSize, gsBlur.Bounds, BlurRadius);
                    //InitialBlurComplete = true;
                }
                else
                {
                    gsDynamicImage.SourceImage = imageInProgress;
                }
            }
            if (temporarySymbol is GsPolygon gsPolygon)
            {
                DrawOnPolygon(MousePositionLocal, LineWeight, gsPolygon.LineColor);
                //gsPolygon.Polygon = tempPolygonBmp;

            }
            temporarySymbol?.DrawSymbol(graphic);
        }
        if (ShowNonOutputWidgets)
        {
            List<GraphicSymbol> symbols = parentEditor.GetSelectedSymbols();
            foreach (GraphicSymbol symbol in symbols)
            {
                symbol.DrawHitboxes(graphic);
            }
        }
    }
    #endregion

    #region Drawing Freehand ----------------------------------------------------------------------------

    readonly Pen freehandPen = new(Color.Red, 3);
    PolygonDrawing? polygonDrawing;
    Point oldFreehandPosition = Point.Empty;
    bool freehandInProgress = false;

    private void DrawOnPolygon(Point point, int lineWidth, Color color)
    {
        freehandPen.Width = lineWidth;
        freehandPen.Color = color;
        freehandPen.StartCap = System.Drawing.Drawing2D.LineCap.Round;
        freehandPen.EndCap = System.Drawing.Drawing2D.LineCap.Round;
        if (polygonDrawing == null)
        {
            polygonDrawing = new PolygonDrawing(freehandPen);
        }
        if (freehandInProgress == false)
        {
            oldFreehandPosition = MousePositionLocal;
            freehandInProgress = true;
        }

        polygonDrawing.AddPoint(point);
        oldFreehandPosition = point;
    }

    #endregion

    #region Symbols -------------------------------------------------------------------------------------



    private GraphicSymbol? GetNewSymbol(Point MousePosition, bool SquareBounds, bool temp)
    {
        Point dragEnd = MousePosition;
        int lineWeight = parentEditor.GetNewSymbolProperties().lineWeight;
        bool shadow = parentEditor.GetNewSymbolProperties().shadow;

        if (SquareBounds)
        {
            dragEnd = SymbolProcessing.RestrainProportions(dragStart, dragEnd, new Size(1, 1)); // size is 1:1, ration is 1, meaning square
        }

        if (dragStarted)
        {
            int dragLeft = Math.Min(dragStart.X, dragEnd.X);
            int dragRight = Math.Max(dragStart.X, dragEnd.X);
            int dragTop = Math.Min(dragStart.Y, dragEnd.Y);
            int dragBottom = Math.Max(dragStart.Y, dragEnd.Y);
            int dragWidth = dragRight - dragLeft;
            int dragHeight = dragBottom - dragTop;
            Point size = new(dragWidth, dragHeight);

            Point upperLeft = new(dragLeft, dragTop);

            Color lineColor = parentEditor.GetNewSymbolProperties().lineColor;
            Color fillColor = parentEditor.GetNewSymbolProperties().fillColor;

            // Check that the symbol won't be drawn invisible

            Color lineColorForceVisible = lineColor;
            if (lineColor == Color.Transparent) // used for things without a fill option, always show SOMETHING
            {
                lineColorForceVisible = Color.Black;
            }
            if (lineColor == Color.Transparent && fillColor == Color.Transparent) // used for things with fill option, always show SOMETHING
            {
                lineColor = Color.Black;
            }
            int lineWeightForceVisible = lineWeight;
            if (fillColor == Color.Transparent && lineWeight < 1)
            {
                lineWeightForceVisible = 1;
            }

            int NumberedSize = Settings.Default.GsNumberedDefaultSize;

            return parentEditor.selectedUserAction switch
            {
                ScreenshotEditor.UserActions.CreateRectangle => new GsRectangle(upperLeft, size, lineColor, fillColor, shadow, lineWeightForceVisible),
                ScreenshotEditor.UserActions.CreateCircle => new GsCircle(upperLeft, size, lineColor, fillColor, shadow, lineWeightForceVisible),
                ScreenshotEditor.UserActions.CreateLine => new GsLine(dragStart, dragEnd, lineColorForceVisible, fillColor, shadow, lineWeightForceVisible),
                ScreenshotEditor.UserActions.CreateArrow => new GsArrow(dragStart, dragEnd, lineColorForceVisible, fillColor, shadow, lineWeightForceVisible),
                ScreenshotEditor.UserActions.CreateText => new GsText(dragStart, size, lineColorForceVisible, fillColor, shadow),
                ScreenshotEditor.UserActions.CreateBlur => GsBlur.Create(upperLeft, size, temp, MosaicSize, BlurRadius),
                ScreenshotEditor.UserActions.CreateHighlight => new GsHighlight(upperLeft, size, lineColor, Color.Yellow, false, 0),
                ScreenshotEditor.UserActions.CreateCrop => new GsCrop(upperLeft, size, Color.Black, Color.White), // set line/fill color to a solid, so it isn't skipped in rendering
                ScreenshotEditor.UserActions.CreateNumbered => GsNumbered.Create(new Point(dragEnd.X - (NumberedSize / 2), dragEnd.Y - (NumberedSize / 2)), NumberedSize, shadow),
                ScreenshotEditor.UserActions.DrawFreehand => GsPolygon.Create(new Point(0, 0), polygonDrawing, temp, lineColorForceVisible, Color.Transparent, Math.Max(1, lineWeight), shadow, false),
                ScreenshotEditor.UserActions.DrawFilledCurve => GsPolygon.Create(new Point(0, 0), polygonDrawing, temp, lineColor, fillColor, lineWeightForceVisible, shadow, false),
                _ => null,
            };
        }
        else
        {
            return null;
        }
    }

    private void CreateTempSymbol(Point MousePosition)
    {
        GraphicSymbol? tempSymbol = GetNewSymbol(MousePosition, ScreenshotEditor.GetShift(), true);

        if (tempSymbol != null)
        {
            UpdateOverlay(tempSymbol, forceUpdate: false);
            tempSymbol.Dispose();
        }
    }

    #endregion

    #region Get symbols and hitboxes --------------------------------------------------------------------

    enum HitboxDirection
    {
        None = -1,
        Center = 0,
        NW = 1,
        N = 2,
        NE = 3,
        W = 4,
        E = 5,
        SW = 6,
        S = 7,
        SE = 8,
    }
    HitboxDirection selectedHitboxIndex = HitboxDirection.None;

    private void GetHitboxUnderCursor(Point MousePosition, GraphicSymbol symbol)
    {
        for (int i = 1; i <= 8; i++) // all Scaling hitboxes (corner and edge), not center
        {
            if (symbol != CurrentSelectedSymbol) { break; }

            if (symbol.GetHitbox(i).Contains(MousePosition.X, MousePosition.Y))
            {
                selectedHitboxIndex = (HitboxDirection)i;
                break;
            }
        }
        if (selectedHitboxIndex == HitboxDirection.None)
        {
            if (symbol.GetHitbox(0).Contains(MousePosition.X, MousePosition.Y))
            {
                selectedHitboxIndex = HitboxDirection.Center;
            }
        }
        //}
    }

    private void SelectSymbolUnderCursor()
    {
        List<GraphicSymbol> symbolsUnderCursor = GetSymbolsUnderCursor();
        if (symbolsUnderCursor.Count == 0 && parentEditor.selectedUserAction != ScreenshotEditor.UserActions.ScaleSymbol)
        {
            // empty stack
            stackedSymbolsIndex = -1;
            parentEditor.GetSymbolListView().SelectedItems.Clear();
        }
        else
        {
            if (stackedSymbolsIndex == -1 || stackedSymbolsIndex >= symbolsUnderCursor.Count)
            {
                stackedSymbolsIndex = Math.Max(symbolsUnderCursor.Count - 1, 0);
            }

            if (symbolsUnderCursor.Count > 0)
            {
                GraphicSymbol stackSymbol = symbolsUnderCursor[Math.Clamp(stackedSymbolsIndex, 0, symbolsUnderCursor.Count - 1)];
                if (GetControl() != true)
                {
                    parentEditor.GetSymbolListView().SelectedItems.Clear();
                }
                ListViewItem? listFromSymbol = GetListItemFromSymbol(stackSymbol);
                int selectedIndex = listFromSymbol != null ? listFromSymbol.Index : -1;
                if (selectedIndex > -1 && selectedIndex < parentEditor.GetSymbolListView().Items.Count)
                {
                    parentEditor.GetSymbolListView().Items[selectedIndex].Selected = !parentEditor.GetSymbolListView().Items[selectedIndex].Selected;
                }
                stackedSymbolsIndex--;
            }
            else
            {
                parentEditor.GetSymbolListView().SelectedItems.Clear();
                stackedSymbolsIndex = -1;
            }
        }
    }

    private List<GraphicSymbol> GetSymbolsUnderCursor()
    {
        List<GraphicSymbol> symbolsUnderCursor = [];
        Point cursorPos = pictureBox.PointToClient(Cursor.Position);
        foreach (GraphicSymbol gs in Symbols)
        {
            if (gs.Bounds.Contains(cursorPos) && (gs is GsBorder) == false) // don't select the border symbol, since it covers everything
            {
                symbolsUnderCursor.Add(gs);
            }
        }
        return symbolsUnderCursor;
    }

    private ListViewItem? GetListItemFromSymbol(GraphicSymbol symbol)
    {
        foreach (ListViewItem lvi in parentEditor.GetSymbolListView().Items)
        {
            if (lvi.Tag == symbol)
            {
                return lvi;
            }
        }
        return null;
    }

    #endregion

    #region Mouse input ---------------------------------------------------------------------------------

    Point oldMousePosition = new(0, 0);

    private void SetUserAction(ScreenshotEditor.UserActions action)
    {
        parentEditor.SetUserAction(action);
    }

    public bool dragStarted = false;
    public bool dragMoved = false;
    public Point dragStart = new(0, 0);
    Size currentScaleProportion = new(1, 1);
    readonly List<Point> selectedMoveSymbolOffsets = [];

    public void MouseDown(Point MousePosition)
    {
        MousePositionLocal = MousePosition;
        if (SourceImage == null) return;
        dragStarted = true;
        dragMoved = false;
        dragStart = MousePosition;

        selectedMoveSymbolOffsets.Clear();
        foreach (GraphicSymbol symbol in parentEditor.GetSelectedSymbols())
        {
            selectedMoveSymbolOffsets.Add(MousePosition.Subtract(symbol.Position));
        }

        selectedHitboxIndex = HitboxDirection.None;
        foreach (GraphicSymbol symbol in parentEditor.GetSelectedSymbols())
        {
            GetHitboxUnderCursor(MousePosition, symbol);
        }

        if (parentEditor.selectedUserAction < ScreenshotEditor.UserActions.CreateRectangle) // action is none, move or scale
        {
            if (selectedHitboxIndex == HitboxDirection.Center)
            {
                SetUserAction(ScreenshotEditor.UserActions.MoveSymbol);
            }
            else if (selectedHitboxIndex > HitboxDirection.Center)
            {
                SetUserAction(ScreenshotEditor.UserActions.ScaleSymbol);
                if (CurrentSelectedSymbol != null)
                {
                    currentScaleProportion = CurrentSelectedSymbol.Bounds.Size;
                }
                else
                {
                    currentScaleProportion = new Size(1, 1);
                }
            }
            else
            {
                SetUserAction(ScreenshotEditor.UserActions.Select);
            }
        }

        if (overlayGraphics == null)
        {
            CreateOverlay(pictureBox);
        }
    }

    public void MouseMove(Point MousePosition)
    {
        MousePositionLocal = MousePosition;
        if (dragStarted == false) // don't update the selected hitbox index while a drag scale is active
        {
            selectedHitboxIndex = HitboxDirection.None;
            foreach (GraphicSymbol symbol in parentEditor.GetSelectedSymbols())
            {
                GetHitboxUnderCursor(MousePosition, symbol);
            }
        }

        if (parentEditor.selectedUserAction >= UserActions.CreateRectangle)
        {
            pictureBox.Cursor = Cursors.Cross;
        }
        else if (!dragStarted)
        {
            pictureBox.Cursor = Cursors.Arrow;
        }

        if (CurrentSelectedSymbol != null)
        {

            if (CurrentSelectedSymbol.MoveAllowed)
            {
                if (selectedHitboxIndex == HitboxDirection.Center)
                {
                    pictureBox.Cursor = Cursors.SizeAll;
                }
            }
            if (CurrentSelectedSymbol.ScalingAllowed)
            {
                switch (selectedHitboxIndex)
                {
                    case HitboxDirection.NW: case HitboxDirection.SE: pictureBox.Cursor = Cursors.SizeNWSE; break;
                    case HitboxDirection.NE: case HitboxDirection.SW: pictureBox.Cursor = Cursors.SizeNESW; break;
                    case HitboxDirection.W: case HitboxDirection.E: pictureBox.Cursor = Cursors.SizeWE; break;
                    case HitboxDirection.N: case HitboxDirection.S: pictureBox.Cursor = Cursors.SizeNS; break;
                }
            }
            if (CurrentSelectedSymbol is GsLine)
            {
                if ((int)selectedHitboxIndex == 1 || (int)selectedHitboxIndex == 2)
                {
                    pictureBox.Cursor = Cursors.SizeAll;
                }
            }
        }

        if (MousePosition.X != dragStart.X || MousePosition.Y != dragStart.Y)
        {
            dragMoved = true;
        }
        if (SourceImage == null) return;

        if (dragStarted)
        {
            if (parentEditor.selectedUserAction >= ScreenshotEditor.UserActions.CreateRectangle) // any UserAction above CreateRectangle is a new symbol creation
            {
                CreateTempSymbol(MousePosition);
            }
            else if (parentEditor.selectedUserAction == ScreenshotEditor.UserActions.MoveSymbol)
            {
                MoveSymbols(MousePosition);
                UpdateOverlay(null, forceUpdate: false);
            }
            else if (parentEditor.selectedUserAction == ScreenshotEditor.UserActions.ScaleSymbol)
            {
                if (GetShift() && CurrentSelectedSymbol != null)
                {
                    bool restrain = true;
                    Point anchor = new(CurrentSelectedSymbol.Bounds.Left, CurrentSelectedSymbol.Bounds.Top);
                    if (selectedHitboxIndex == HitboxDirection.SE)
                    {
                        anchor = new Point(CurrentSelectedSymbol.Bounds.Left, CurrentSelectedSymbol.Bounds.Top);
                    }
                    else if (selectedHitboxIndex == HitboxDirection.NW)
                    {
                        anchor = new Point(CurrentSelectedSymbol.Bounds.Right, CurrentSelectedSymbol.Bounds.Bottom);
                    }
                    else if (selectedHitboxIndex == HitboxDirection.SW)
                    {
                        anchor = new Point(CurrentSelectedSymbol.Bounds.Right, CurrentSelectedSymbol.Bounds.Top);
                    }
                    else if (selectedHitboxIndex == HitboxDirection.NE)
                    {
                        anchor = new Point(CurrentSelectedSymbol.Bounds.Left, CurrentSelectedSymbol.Bounds.Bottom);
                    }
                    else
                    {
                        restrain = false;
                    }

                    if (restrain)
                    {
                        Point restrainedPosition = SymbolProcessing.RestrainProportions(anchor, MousePosition, currentScaleProportion);
                        ScaleSymbol(restrainedPosition);
                    }
                    else
                    {
                        ScaleSymbol(MousePosition);
                    }

                }
                else
                {
                    ScaleSymbol(MousePosition);
                }
                UpdateOverlay(null, false);
            }
        }

        oldMousePosition = MousePosition;
    }

    int stackedSymbolsIndex = -1;
    public void MouseUp(Point MousePosition)
    {
        MousePositionLocal = MousePosition;
        if (dragStarted == false) // don't bother with symbol stuff when a drag was cancelled or not actually started
        {
            UpdateOverlay();
            parentEditor.UpdatePropertiesPanel();
            return;
        }

        bool SymbolAllowsClickPlacement = parentEditor.selectedUserAction == ScreenshotEditor.UserActions.CreateImage || parentEditor.selectedUserAction == ScreenshotEditor.UserActions.CreateNumbered;

        if (dragMoved == false) // user clicked and released mouse without moving it.
        {
            if (SymbolAllowsClickPlacement) // Don't switch to Select if the action is inserting an unscaled image or Number, since the click place is allowed
            {
                // don't change Action, keep spamming those symbols
            }
            else
            {
                // user clicked instead of dragging, switch to Select
                SetUserAction(ScreenshotEditor.UserActions.Select);
                SelectSymbolUnderCursor();
            }
        }

        GraphicSymbol? symbol = GetNewSymbol(MousePositionLocal, ScreenshotEditor.GetShift(), false); // checks current User Action and creates a symbol based on that
        if (symbol != null)
        {

            if (symbol.ValidSymbol)
            {
                parentEditor.AddNewSymbolToList(symbol);
            }
        }


        UpdateOverlay();
        parentEditor.UpdatePropertiesPanel();
        dragStarted = false;

        if (parentEditor.selectedUserAction == UserActions.DrawFreehand)
        {
            // Continue drawing? freehandInProgress reset so new lines are disconnected from old
            freehandInProgress = false;
        }
        else if (parentEditor.selectedUserAction != ScreenshotEditor.UserActions.MoveSymbol && Settings.Default.SelectAfterPlacingSymbol)
        {
            // Stop drawing
            SetUserAction(ScreenshotEditor.UserActions.Select);
        }

        if (polygonDrawing != null)
        {
            polygonDrawing.Dispose();
            polygonDrawing = null;
        }

        freehandInProgress = false;

        if (parentEditor.selectedUserAction == ScreenshotEditor.UserActions.CreateCrop || parentEditor.selectedUserAction == ScreenshotEditor.UserActions.CreateImage)
        {
            // there's no point in creating consecutive Crops, revert to Select, the same is probably true for images.
            SetUserAction(ScreenshotEditor.UserActions.Select);
        }
    }

    #endregion

    #region Move and Scale ------------------------------------------------------------------------------

    private void MoveSymbols(Point MousePosition)
    {
        List<GraphicSymbol> symbols = parentEditor.GetSelectedSymbols();
        for (int i = 0; i < symbols.Count; i++)
        {
            MoveSymbol(MousePosition, symbols[i], selectedMoveSymbolOffsets[i]);
        }
    }

    private void MoveSymbol(Point MousePosition, GraphicSymbol symbol, Point offset)
    {
        if (symbol == null) return;

        if (symbol.MoveAllowed && dragStarted)
        {
            //Point newPos = new(
            //    Math.Clamp(MousePosition.X - dragStartOffsetFromSymbolCenter.X, -OutOfBoundsMaxPixels, CanvasSize.Width + OutOfBoundsMaxPixels),
            //    Math.Clamp(MousePosition.Y - dragStartOffsetFromSymbolCenter.Y, -OutOfBoundsMaxPixels, CanvasSize.Height + OutOfBoundsMaxPixels)
            //);            
            Point newPos = new(
                Math.Clamp(MousePosition.X - offset.X, -OutOfBoundsMaxPixels, CanvasSize.Width + OutOfBoundsMaxPixels),
                Math.Clamp(MousePosition.Y - offset.Y, -OutOfBoundsMaxPixels, CanvasSize.Height + OutOfBoundsMaxPixels)
            );
            symbol.MoveTo(newPos.X, newPos.Y);
        }
    }

    private void ScaleSymbol(Point MousePosition)
    {
        if (CurrentSelectedSymbol == null) return;
        if (dragStarted == false) return;

        if (CurrentSelectedSymbol is GsLine)
        {
            if ((int)selectedHitboxIndex == 1)
            {
                CurrentSelectedSymbol.StartPoint = MousePosition;
            }
            if ((int)selectedHitboxIndex == 2)
            {
                CurrentSelectedSymbol.EndPoint = MousePosition;
            }
        }
        else if (CurrentSelectedSymbol.ScalingAllowed)
        {
            if (selectedHitboxIndex == HitboxDirection.W || selectedHitboxIndex == HitboxDirection.NW || selectedHitboxIndex == HitboxDirection.SW)
            {
                CurrentSelectedSymbol.MoveLeftEdgeTo(MousePosition.X);
            }
            if (selectedHitboxIndex == HitboxDirection.E || selectedHitboxIndex == HitboxDirection.NE || selectedHitboxIndex == HitboxDirection.SE)
            {
                CurrentSelectedSymbol.MoveRightEdgeTo(MousePosition.X);
            }
            if (selectedHitboxIndex == HitboxDirection.N || selectedHitboxIndex == HitboxDirection.NE || selectedHitboxIndex == HitboxDirection.NW)
            {
                CurrentSelectedSymbol.MoveTopEdgeTo(MousePosition.Y);
            }
            if (selectedHitboxIndex == HitboxDirection.S || selectedHitboxIndex == HitboxDirection.SE || selectedHitboxIndex == HitboxDirection.SW)
            {
                CurrentSelectedSymbol.MoveBottomEdgeTo(MousePosition.Y);
            }
        }
    }
    #endregion


}
