using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Drawing.Text;
using System.Runtime.Versioning;
using static ScreenShotTool.ImageView;

namespace ScreenShotTool;
[SupportedOSPlatform("windows")]

public class CaptureModule : ImageViewModule
{
    private bool CompleteCaptureOnMouseRelease = false;
    private bool SaveToFile = false;
    private bool SendToClipboard = false;
    private bool SendToEditor = false;
    private bool ShowAdjustmentArrows = true;
    private bool showHelp = false;

    private readonly SolidBrush brushZoomRegion;
    private readonly SolidBrush brushFill;
    private readonly SolidBrush brushHelpBG;
    private readonly SolidBrush blackBrush;
    private readonly SolidBrush brushText;
    private readonly Pen linePen;
    private readonly Pen arrowPen;
    private readonly Pen zoomRegionPen;
    public Color lineColor = Color.Green;
    public Color arrowColor = Color.Yellow;
    public Color maskColor = Color.FromArgb(120, 0, 0, 0);
    public Color textColor = Color.LightGreen;
    public Rectangle ScreenBounds;

    Bitmap? tempImage;

    int zoomPositionH = 30; // move the zoom box around the cursor to avoid the edges of the screen
    int zoomPositionV = 70;
    readonly int zoomRadius = 20;
    readonly float zoomLevel = 10;
    int zoomSize = 30;

    Rectangle regionRect = new();

    public Bitmap? ImageResult;
    ImageView parentForm;

    private enum AdjustMode
    {
        None,
        Position,
        Size
    }
    private AdjustMode adjustMode = AdjustMode.Size;

    public CaptureModule(ImageView parentForm, Rectangle screenBounds) : base()
    {
        brushZoomRegion = new SolidBrush(lineColor);
        brushFill = new SolidBrush(maskColor);
        brushHelpBG = new SolidBrush(Color.FromArgb(200, 0, 0, 0));
        brushText = new SolidBrush(textColor);
        blackBrush = new SolidBrush(Color.Black);
        linePen = new Pen(lineColor);
        arrowPen = new Pen(arrowColor);
        zoomRegionPen = new Pen(brushZoomRegion);
        this.parentForm = parentForm;

        CompleteCaptureOnMouseRelease = parentForm.CompleteCaptureOnMouseRelease;
        SaveToFile = parentForm.SaveToFile;
        SendToClipboard = parentForm.SendToClipboard;
        SendToEditor = parentForm.SendToEditor;
        ScreenBounds = screenBounds;

        //Debug.WriteLine($"Screenbounds: {ScreenBounds}");
    }

    public override void HandleKeys(KeyEventArgs e)
    {
        if (e.Modifiers == Keys.Shift)
        {
            boostMultiplier = 10;
        }
        else
        {
            boostMultiplier = 1;
        }

        if (e.KeyCode == Keys.Escape)
        {
            Debug.WriteLine("Exiting ImageView");
            parentForm.isClosing = true;
            DisposeAllImages();
            parentForm.DialogResult = DialogResult.Cancel;
        }
        else if (e.KeyCode == Keys.Return)
        {
            DisposeSourceImage();
            parentForm.isClosing = true;
            parentForm.DialogResult = DialogResult.Yes;
        }
        else if (e.KeyCode == Keys.C)
        {
            if (ImageResult != null)
            {
                Clipboard.SetImage(ImageResult);
                parentForm.isClosing = true;
                DisposeAllImages();
                parentForm.DialogResult = DialogResult.No;
            }
            else
            {
                Debug.WriteLine("Can't copy image, ImageResult is null");
            }
        }
        else if (e.KeyCode == Keys.E)
        {
            if (ImageResult != null)
            {
                ImageView.OpenImageInEditor(ImageResult);
                parentForm.isClosing = true;
                DisposeSourceImage();
                parentForm.DialogResult = DialogResult.No;
            }
            else
            {
                Debug.WriteLine("Can't start editor, ImageResult is null");
            }
        }
        else if (e.KeyCode == Keys.S)
        {
            adjustMode = AdjustMode.Size;
        }
        else if (e.KeyCode == Keys.P)
        {
            adjustMode = AdjustMode.Position;
        }
        else if (e.KeyCode == Keys.H)
        {
            showHelp = !showHelp;
        }

        else if (e.KeyCode == Keys.Left)
        {
            if (e.Modifiers == Keys.Control)
            {
                AdjustLeftMultiplier = 1;
                AdjustRightMultiplier = 0;
            }
            else
            {
                AdjustRegion(-1, 0);
            }
        }
        else if (e.KeyCode == Keys.Right)
        {
            if (e.Modifiers == Keys.Control)
            {
                AdjustLeftMultiplier = 0;
                AdjustRightMultiplier = 1;
            }
            else
            {
                AdjustRegion(1, 0);
            }
        }
        else if (e.KeyCode == Keys.Up)
        {
            if (e.Modifiers == Keys.Control)
            {
                AdjustTopMultiplier = 1;
                AdjustBottomMultiplier = 0;
            }
            else
            {
                AdjustRegion(0, -1);
            }
        }
        else if (e.KeyCode == Keys.Down)
        {
            if (e.Modifiers == Keys.Control)
            {
                AdjustTopMultiplier = 0;
                AdjustBottomMultiplier = 1;
            }
            else
            {
                AdjustRegion(0, 1);
            }
        }
    }

    public override void MouseUp(MouseEventArgs e)
    {
        //Debug.WriteLine($"Mouse up: {regionRect} in {ScreenBounds}");
        mouseDrag = false;
        CloneRegionImage();

        if (CompleteCaptureOnMouseRelease)
        {
            Debug.WriteLine("Mouse up. Stop viewer based on release options");
            bool disposeAll = true;
            parentForm.isClosing = true;

            if (SendToClipboard)
            {
                Debug.WriteLine("Mouse up. Send to Clipboard");
                if (ImageResult != null)
                {
                    Clipboard.SetImage(ImageResult);
                }
            }

            if (SendToEditor)
            {
                Debug.WriteLine("Mouse up. Send to Editor");
                if (ImageResult != null)
                {
                    Bitmap clonedForEditor = ImageResult.Clone(new Rectangle(0, 0, ImageResult.Width, ImageResult.Height), System.Drawing.Imaging.PixelFormat.Format32bppArgb); //(regionRect, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
                    OpenImageInEditor(clonedForEditor);
                }
                disposeAll = false;
            }

            if (SaveToFile)
            {
                Debug.WriteLine("Mouse up. Send to File");
                DisposeSourceImage();
                parentForm.DialogResult = DialogResult.Yes;
            }
            else
            {
                if (disposeAll)
                {
                    DisposeAllImages();
                }
                else
                {
                    DisposeSourceImage();
                }
                parentForm.DialogResult = DialogResult.No;
            }
        }
    }

    public override void MouseLeave(EventArgs e)
    {
        mouseDrag = false;
    }

    public override void MouseDown(MouseEventArgs e)
    {
        regionRect = new Rectangle();
        screenSizedBitmap.DisposeAndNull();
        screenSizedBitmap = new Bitmap(parentForm.Width, parentForm.Height);
        parentForm.pictureBoxDraw.Image = screenSizedBitmap;
        mouseStartX = Cursor.Position.X;
        mouseStartY = Cursor.Position.Y;
        mouseDrag = true;
    }

    #region Adjust Region bounds -------------------
    int AdjustLeftMultiplier = 0;
    int AdjustRightMultiplier = 1;
    int AdjustTopMultiplier = 0;
    int AdjustBottomMultiplier = 1;
    int boostMultiplier = 1;
    private void AdjustRegion(int x, int y)
    {
        if (adjustMode == AdjustMode.Size)
        {
            AdjustRegionSize(x, y);
        }
        else if (adjustMode == AdjustMode.Position)
        {
            AdjustRegionPosition(x, y);
        }
        CloneRegionImage();
    }

    private void AdjustRegionSize(int x, int y)
    {
        regionRect.X += x * AdjustLeftMultiplier * boostMultiplier;
        regionRect.Width += ((x * AdjustRightMultiplier) - (x * AdjustLeftMultiplier)) * boostMultiplier; //if Left is changed, width must update to keep size
        regionRect.Y += y * AdjustTopMultiplier * boostMultiplier;
        regionRect.Height += ((y * AdjustBottomMultiplier) - (y * AdjustTopMultiplier)) * boostMultiplier;
    }

    private void AdjustRegionPosition(int x, int y)
    {
        regionRect.X += x * boostMultiplier;
        regionRect.Y += y * boostMultiplier;
    }

    #endregion

    private void CloneRegionImage()
    {
        
        if (regionRect.Width > 0 && regionRect.Height > 0)
        {
            Bitmap regionBmp;
            regionBmp = new Bitmap(parentForm.pictureBoxScreenshot.Image);
            regionRect = MakeSafeRegion(regionRect, new Rectangle(0,0,regionBmp.Width,regionBmp.Height)); // check that the region selected from the screenshot is within the screenshot bounds
            ImageResult = regionBmp.Clone(regionRect, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            regionBmp.Dispose();
        }
    }

    private Rectangle MakeSafeRegion(Rectangle region, Rectangle imageBounds)
    {
        //Debug.WriteLine($"RegionRect: {regionRect}, screenBounds: {screenBounds} ");
        int leftmost = region.Left;
        int topmost = region.Top;
        int rightmost = region.Right;
        int bottommost = region.Bottom;
        int width = region.Width;
        int height = region.Height;
        if (leftmost < imageBounds.Left)
        {
            Debug.WriteLine($"left corrected from {leftmost} to {imageBounds.Left}");
            leftmost = imageBounds.Left;
        }
        if (topmost < imageBounds.Top)
        {
            Debug.WriteLine($"top corrected from {topmost} to {imageBounds.Top}");
            topmost = imageBounds.Top;
        }
        if (rightmost > imageBounds.Right)
        {
            Debug.WriteLine($"right corrected from {rightmost} to {imageBounds.Right}");
            rightmost = imageBounds.Right;
        }
        if (bottommost > imageBounds.Bottom)
        {
            Debug.WriteLine($"bottom corrected from {bottommost} to {imageBounds.Bottom}");
            bottommost = imageBounds.Bottom;
        }
        width = rightmost - leftmost;
        height = bottommost - topmost;
        if (width < 0)
        {
            width = 0;
            Debug.WriteLine($"Warning, width was below 0");
        }
        if (height < 0)
        {
            height = 0;
            Debug.WriteLine($"Warning, heigth was below 0");
        }
        return new Rectangle(leftmost, topmost, width, height);
    }

    private void DisposeAllImages()
    {
        ImageResult?.Dispose();
        ImageSource?.Dispose();
    }
    private void DisposeSourceImage()
    {
        ImageSource?.Dispose();
    }

    bool mouseDrag = false;
    int mouseStartX = 0;
    int mouseStartY = 0;

    Bitmap? screenSizedBitmap;

    Graphics? drawGraphic;
    Bitmap? DrawOutputBmp;

    public override void Update()
    {
        float MilliSecondsPerFrame = (1f / parentForm.frameRate) * 1000;
        TimeSpan ts = DateTime.Now - parentForm.LastFrame;
        if (ts.Milliseconds >= MilliSecondsPerFrame)
        {
            tempImage.DisposeAndNull();

            tempImage = DrawOverlay(true, true);

            parentForm.pictureBoxDraw.Image = tempImage;
            parentForm.LastFrame = DateTime.Now;
        }
    }

    public Bitmap DrawOverlay(bool drawSquare, bool drawText, bool drawZoom = true)
    {
        //outputImage.Dispose();
        DrawOutputBmp.DisposeAndNull();
        DrawOutputBmp = new Bitmap(parentForm.Width, parentForm.Height);

        drawGraphic.DisposeAndNull();
        drawGraphic = Graphics.FromImage(DrawOutputBmp);
        drawGraphic.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
        drawGraphic.TextRenderingHint = TextRenderingHint.AntiAliasGridFit; // fixes ugly aliasing on text

        int rectX = mouseStartX - ScreenBounds.X;
        int rectY = mouseStartY - ScreenBounds.Y;
        int rectWidth = Cursor.Position.X - mouseStartX;
        int rectHeight = Cursor.Position.Y - mouseStartY;
        if (rectWidth < 0)
        {
            rectX += rectWidth;
            rectWidth *= -1;
        }
        if (rectHeight < 0)
        {
            rectY += rectHeight;
            rectHeight *= -1;
        }

        if (mouseDrag)
        {
            regionRect = new Rectangle(rectX, rectY, rectWidth, rectHeight);
        }

        if (drawSquare)
        {
            DrawSelectionBox(drawGraphic, linePen);
            if (Settings.Default.MaskRegion && regionRect.Width > 0 && regionRect.Height > 0)
            {
                MaskRectangle(drawGraphic, new Rectangle(0, 0, ScreenBounds.Width, ScreenBounds.Height), regionRect, brushFill);
            }
        }

        if (ShowAdjustmentArrows)
        {
            DrawAdjustmentArrows(drawGraphic);
        }

        if (drawZoom)
        {
            DrawZoomView(drawGraphic, parentForm.pictureBoxScreenshot.Image);
        }

        if (drawText)
        {
            DrawInfoText(drawGraphic);
        }

        if (rectWidth > 0 && rectHeight > 0)
        {
            //squareCreated = true;
        }
        return DrawOutputBmp;
    }

    Bitmap CropImage(Bitmap img, Rectangle cropArea)
    {
        //https://www.codingdefined.com/2015/04/solved-bitmapclone-out-of-memory.html
        Bitmap bmp = new Bitmap(cropArea.Width, cropArea.Height);

        using (Graphics gph = Graphics.FromImage(bmp))
        {
            gph.FillRectangle(blackBrush, new Rectangle(0, 0, 100, 100));
            gph.DrawImage(img, new Rectangle(0, 0, bmp.Width, bmp.Height), cropArea, GraphicsUnit.Pixel);
        }
        return bmp;
    }

    Bitmap? screenshotBmp;
    private void DrawZoomView(Graphics graphic, Image screenshotInput)
    {
        if (parentForm.isClosing) { return; }

        try
        {
            screenshotBmp.DisposeAndNull();
            screenshotBmp = new Bitmap(screenshotInput);
        }
        catch
        {
            Debug.WriteLine("Error updating Zoom view. Possibly when Disposing and closing form.");
        }

        if (screenshotBmp == null) { return; }

        zoomSize = (int)(zoomRadius * zoomLevel);
        float cursorX = Cursor.Position.X - ScreenBounds.X;
        float cursorY = Cursor.Position.Y - ScreenBounds.Y;

        Rectangle zoomRect = new Rectangle((int)cursorX - zoomRadius, (int)cursorY - zoomRadius, zoomRadius * 2, zoomRadius * 2);

        Bitmap zoomImage = CropImage(screenshotBmp, zoomRect);

        //move zoom viewer around the cursor
        if (Cursor.Position.X + zoomSize + zoomPositionH > ScreenBounds.Right)
        {
            zoomPositionH = -zoomSize - 30;
        }
        if (Cursor.Position.Y + zoomSize + zoomPositionV > ScreenBounds.Bottom)
        {
            zoomPositionV = -zoomSize - 30;
        }
        if (Cursor.Position.X - zoomSize < ScreenBounds.Left)
        {
            zoomPositionH = 30;
        }
        if (Cursor.Position.Y - zoomSize < ScreenBounds.Top)
        {
            zoomPositionV = 70;
        }

        Rectangle zoomBorder = new Rectangle(
            Cursor.Position.X - ScreenBounds.X + zoomPositionH,
            Cursor.Position.Y - ScreenBounds.Y + zoomPositionV,
            zoomSize,
            zoomSize
        );


        graphic.DrawImage(zoomImage, zoomBorder.X, zoomBorder.Y, zoomBorder.Width, zoomBorder.Height);

        graphic.DrawRectangle(linePen, zoomBorder);

        graphic.DrawLine(linePen,
            zoomBorder.X + (zoomBorder.Width / 2) - (zoomLevel / 4),
            zoomBorder.Y,
            zoomBorder.X + (zoomBorder.Width / 2) - (zoomLevel / 4),
            zoomBorder.Y + zoomBorder.Height);
        graphic.DrawLine(linePen,
            zoomBorder.X,
            zoomBorder.Y + (zoomBorder.Height / 2) - (zoomLevel / 4),
            zoomBorder.X + zoomBorder.Width,
            zoomBorder.Y + (zoomBorder.Height / 2) - (zoomLevel / 4));

        Rectangle testDisplayRect = new Rectangle(
            (int)(-(cursorX * 4f)),
            (int)(-(cursorY * 4f)),
            regionRect.Width,
            regionRect.Height
        );

        testDisplayRect.X += (int)(regionRect.X * 5f) + zoomPositionH;
        testDisplayRect.Y += (int)(regionRect.Y * 5f) + zoomPositionV;

        Rectangle ActiveRegionRect = new Rectangle(
            testDisplayRect.X + (zoomBorder.Height / 2) - 3,
            testDisplayRect.Y + (zoomBorder.Width / 2) - 3,
            testDisplayRect.Width * 5,
            testDisplayRect.Height * 5
        );

        // crop region marker rectangle if it's outside the zoom rectangle
        bool drawActiveRegion = true;

        int leftCorrection = ActiveRegionRect.Left - zoomBorder.Left;
        if (ActiveRegionRect.Right < zoomBorder.Left)
        {
            drawActiveRegion = false;
        }
        else if (leftCorrection < 0)
        {
            ActiveRegionRect.X = zoomBorder.X;
            ActiveRegionRect.Width += leftCorrection;
        }

        int rightCorrection = ActiveRegionRect.Right - zoomBorder.Right;
        if (ActiveRegionRect.Left > zoomBorder.Right)
        {
            drawActiveRegion = false;
        }
        else if (ActiveRegionRect.Right > zoomBorder.Right)
        {
            ActiveRegionRect.Width -= rightCorrection;
        }

        int topCorrection = ActiveRegionRect.Top - zoomBorder.Top;
        if (ActiveRegionRect.Top > zoomBorder.Bottom)
        {
            drawActiveRegion = false;
        }
        else if (topCorrection < 0)
        {
            ActiveRegionRect.Y = zoomBorder.Y;
            ActiveRegionRect.Height += topCorrection;
        }

        int bottomCorrection = ActiveRegionRect.Bottom - zoomBorder.Bottom;
        if (ActiveRegionRect.Top > zoomBorder.Bottom)
        {
            drawActiveRegion = false;
        }
        else if (ActiveRegionRect.Bottom > zoomBorder.Bottom)
        {
            ActiveRegionRect.Height -= bottomCorrection;
        }

        if (drawActiveRegion)
        {
            graphic.DrawRectangle(zoomRegionPen, ActiveRegionRect);
        }

        MaskRectangle(graphic, zoomBorder, ActiveRegionRect, brushFill);

        screenshotBmp.Dispose();
        zoomImage.Dispose();
    }

    private void DrawInfoText(Graphics graphic)
    {
        int textX = Cursor.Position.X + zoomPositionH - ScreenBounds.X;
        int textY = Cursor.Position.Y + zoomPositionV + zoomSize + 3 - ScreenBounds.Y;
        graphic.FillRectangle(brushHelpBG, new Rectangle(textX, textY, zoomSize, 40));
        graphic.DrawString($"W:{regionRect.Width,4} H:{regionRect.Height,4} Esc: Exit, H: Help\nEnter: Save, C: Clipboard, E: Edit", parentForm.Font, brushText, textX, textY);
        if (showHelp)
        {
            graphic.FillRectangle(brushHelpBG, new Rectangle(10, 10, 250, 200));
            graphic.DrawString($"Enter: Save\nC: Copy\n E: Open in Editor\nEsc: Cancel\nS: Size\nP: Position\nArrows: Move\nCtrl+Arrows: Select adjust side\nShift+Arrows: Fast adjust\nH: Toggle help", parentForm.Font, brushText, 20, 20);
        }
    }

    private void DrawSelectionBox(Graphics graphic, Pen pen)
    {
        if (regionRect.Width == 0 || regionRect.Height == 0) return;
        graphic.DrawRectangle(pen, regionRect);
        //graphic.FillRectangle(brushFill, regionRect);
    }

    private void DrawAdjustmentArrows(Graphics graphic)
    {
        if (regionRect.Width == 0 || regionRect.Height == 0) return;
        int RightSide = regionRect.Right;
        int LeftSide = regionRect.Left;
        int TopSide = regionRect.Top;
        int BottomSide = regionRect.Bottom;
        int HalfHeight = regionRect.Height / 2;
        int HalfWidth = regionRect.Width / 2;
        int MiddleVertical = TopSide + HalfHeight;
        int MiddleHorizontal = LeftSide + HalfWidth;

        if (AdjustRightMultiplier != 0 || adjustMode == AdjustMode.Position)
        {
            graphic.DrawPolygon(arrowPen, new Point[] { new Point(RightSide + 5, MiddleVertical - 5), new Point(RightSide + 10, MiddleVertical), new Point(RightSide + 5, MiddleVertical + 5) });
        }
        if (AdjustLeftMultiplier != 0 || adjustMode == AdjustMode.Position)
        {
            graphic.DrawPolygon(arrowPen, new Point[] { new Point(LeftSide - 5, MiddleVertical - 5), new Point(LeftSide - 10, MiddleVertical), new Point(LeftSide - 5, MiddleVertical + 5) });
        }

        if (AdjustTopMultiplier != 0 || adjustMode == AdjustMode.Position)
        {
            graphic.DrawPolygon(arrowPen, new Point[] { new Point(MiddleHorizontal - 5, TopSide - 5), new Point(MiddleHorizontal, TopSide - 10), new Point(MiddleHorizontal + 5, TopSide - 5) });
        }
        if (AdjustBottomMultiplier != 0 || adjustMode == AdjustMode.Position)
        {
            graphic.DrawPolygon(arrowPen, new Point[] { new Point(MiddleHorizontal - 5, BottomSide + 5), new Point(MiddleHorizontal, BottomSide + 10), new Point(MiddleHorizontal + 5, BottomSide + 5) });
        }
    }
}
