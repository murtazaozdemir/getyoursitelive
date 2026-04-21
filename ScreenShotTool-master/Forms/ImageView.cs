using ScreenShotTool.Forms;
using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;

namespace ScreenShotTool
{
#pragma warning disable IDE0090 // Use 'new(...)'

    [SupportedOSPlatform("windows")]
    public partial class ImageView : Form
    {
        public bool CompleteCaptureOnMouseRelease = Settings.Default.RegionCompletesOnMouseRelease;
        public bool SaveToFile = Settings.Default.RegionToFile;
        public bool SendToClipboard = Settings.Default.RegionToClipboard;
        public bool SendToEditor = Settings.Default.RegionToEditor;
        public int X = 0;
        public int Y = 0;
        //public readonly Screen screen;
        public Rectangle ScreenBounds;
        public float frameRate = 60f;
        ImageViewModule module;
        public bool isClosing = false; // if true, don't update the view, prevent referencing disposed images.
        public Color PickedColor = Color.Empty;

        public enum ViewerMode
        {
            None,
            cropCapture,
            colorPicker
        }
        private ViewerMode viewerMode;

        [LibraryImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static partial bool SetForegroundWindow(IntPtr hWnd);


        public static ImageView CreateUsingCurrentScreen(ViewerMode mode)
        {
            Screen screen = Screen.FromPoint(Cursor.Position);
            Rectangle screenBounds = screen.Bounds;
            return Create(mode, screenBounds);
        }

        public static ImageView CreateUsingAllScreens(ViewerMode mode)
        {
            Rectangle screenBounds = SystemInformation.VirtualScreen;
            return Create(mode, screenBounds);
        }

        public static ImageView Create(ViewerMode mode, Rectangle screenBounds)
        {
            Bitmap bmp = GetScreenImage(screenBounds);
            ImageView result = new ImageView(mode, screenBounds, bmp)
            {
                ScreenBounds = screenBounds,
                StartPosition = FormStartPosition.Manual,
                Location = new Point(screenBounds.X, screenBounds.Y),
                Size = screenBounds.Size,
            };
            return result;
        }

        public ImageView(ViewerMode mode, Rectangle screenBounds, Bitmap? image)
        {
            this.ScreenBounds = screenBounds;
            frameRate = Settings.Default.MaxFramerate;
            InitializeComponent();
            AutoScaleMode = AutoScaleMode.None;
            Font = new Font(this.Font.FontFamily, 10);

            viewerMode = mode;
            if (viewerMode == ViewerMode.cropCapture)
            {
                module = new CaptureModule(this, ScreenBounds);
            }
            else // if (viewerMode == ViewerMode.colorPicker)
            {
                module = new ColorPickerModule(this, ScreenBounds);
            }

            if (image != null)
            {
                module.ImageSource = image;
            }
            pictureBoxDraw.Image = new Bitmap(10, 10);
        }

        private void ImageView_Load(object sender, EventArgs e)
        {
            SetForegroundWindow(Handle);
        }

        public static Bitmap GetScreenImage(Rectangle screenBounds)//Screen screen)
        {
            //Rectangle screenBound = screen.Bounds;//SystemInformation.VirtualScreen;
            if (screenBounds.Width > 0 && screenBounds.Height > 0)
            {
                return ImageProcessing.CaptureBitmap(screenBounds.Left, screenBounds.Top, screenBounds.Width, screenBounds.Height);//, forceTransparencyFix: true);
            }
            else
            {
                Debug.WriteLine("Screen bounds size is less than zero. Capture aborted.");
            }

            return new Bitmap(0, 0);
        }

        //public static Bitmap CaptureBitmap(int x, int y, int width, int height)
        //{
        //    Bitmap captureBitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        //    Graphics captureGraphics = Graphics.FromImage(captureBitmap);

        //    Rectangle captureRectangle = new Rectangle(x, y, width, height);

        //    //Copying Image from The Screen
        //    captureGraphics.CopyFromScreen(captureRectangle.Left, captureRectangle.Top, 0, 0, captureRectangle.Size);
        //    captureGraphics.Dispose();

        //    ImageProcessing.FixTransparentPixels(width, height, captureBitmap);

        //    return captureBitmap;
        //}



        public Bitmap? GetBitmap()
        {
            if (module is CaptureModule captureModule)
                return captureModule.ImageResult;
            else
                return null;
        }

        public void SetImage()
        {
            pictureBoxScreenshot.Image = module.ImageSource;
            pictureBoxDraw.Parent = pictureBoxScreenshot;
            pictureBoxDraw.BackColor = Color.Transparent;
            pictureBoxDraw.Location = pictureBoxScreenshot.Location;
            pictureBoxDraw.Size = pictureBoxScreenshot.Size;
        }

        private void ImageView_KeyDown(object sender, KeyEventArgs e)
        {

            module.HandleKeys(e);
            module.Update();
        }

        public static void OpenImageInEditor(Image img)
        {
            ScreenshotEditor imageEditor = new ScreenshotEditor(img);
            imageEditor.Show();
        }



        private void PictureBoxDraw_MouseDown(object sender, MouseEventArgs e)
        {
            module.MouseDown(e);
        }



        private void PictureBoxDraw_MouseUp(object sender, MouseEventArgs e)
        {
            module.MouseUp(e);
        }


        private void PictureBoxDraw_MouseMove(object sender, MouseEventArgs e)
        {
            module.MouseMove(e);
            module.Update();
        }


        private void PictureBoxDraw_MouseLeave(object sender, EventArgs e)
        {
            module.MouseLeave(e);
        }


        public DateTime LastFrame = DateTime.Now;

        public static void MaskRectangle(Graphics graphic, Rectangle ContainerRegion, Rectangle ActiveRegion, Brush maskingBrush)
        {
            int LeftSide = Math.Clamp(ActiveRegion.Left, ContainerRegion.Left, ContainerRegion.Right);
            int RightSide = Math.Clamp(ActiveRegion.Right, ContainerRegion.Left, ContainerRegion.Right);
            int TopSide = Math.Clamp(ActiveRegion.Top, ContainerRegion.Top, ContainerRegion.Bottom);
            int BottomSide = Math.Clamp(ActiveRegion.Bottom, ContainerRegion.Top, ContainerRegion.Bottom);
            int LeftSpace = LeftSide - ContainerRegion.Left;
            int RightSpace = ContainerRegion.Right - RightSide;
            int TopSpace = TopSide - ContainerRegion.Top;
            int BottomSpace = ContainerRegion.Bottom - BottomSide;
            int width = RightSide - LeftSide;
            //int height = BottomSide - TopSide;

            if (ActiveRegion.Left > ContainerRegion.Left)
            {
                graphic.FillRectangle(maskingBrush, new Rectangle(ContainerRegion.Left, ContainerRegion.Top, LeftSpace, ContainerRegion.Height));
            }
            if (ActiveRegion.Right < ContainerRegion.Right)
            {
                graphic.FillRectangle(maskingBrush, new Rectangle(RightSide, ContainerRegion.Top, RightSpace, ContainerRegion.Height));
            }


            if (ActiveRegion.Top > ContainerRegion.Top)
            {
                graphic.FillRectangle(maskingBrush, new Rectangle(LeftSide, ContainerRegion.Top, width, TopSpace));
            }

            if (ActiveRegion.Bottom < ContainerRegion.Bottom)
            {
                graphic.FillRectangle(maskingBrush, new Rectangle(LeftSide, BottomSide, width, BottomSpace));
            }
        }

        private void ImageView_FormClosing(object sender, FormClosingEventArgs e)
        {
            isClosing = true;
        }
    }
}
