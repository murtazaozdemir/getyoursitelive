using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool;
[SupportedOSPlatform("windows")]
internal class ColorPickerModule : ImageViewModule
{
    ImageView parentForm;
    public Color PickedColor = Color.Empty;
    SolidBrush brushHelpBG = new(Color.FromArgb(200, 0, 0, 0));
    SolidBrush textBrush = new(Color.White);
    Pen linePen = new Pen(Color.Red);
    Rectangle ImageRect;
    Bitmap? tempImage;
    Font font;
    private Rectangle ScreenBounds;

    Bitmap? DrawOutputBmp;
    Graphics? drawGraphic;

    public ColorPickerModule(ImageView parentForm, Rectangle screenBounds)
    {
        this.parentForm = parentForm;
        font = new Font(FontFamily.GenericMonospace, 8f);
        ScreenBounds = screenBounds;
        //parentForm.Location = ScreenBounds.Location;
        //parentForm.Size = ScreenBounds.Size;
    }

    public override void Update()
    {
        float MilliSecondsPerFrame = (1f / parentForm.frameRate) * 1000;
        TimeSpan ts = DateTime.Now - parentForm.LastFrame;
        if (ts.Milliseconds >= MilliSecondsPerFrame)
        {
            tempImage.DisposeAndNull();

            tempImage = DrawOverlay();

            parentForm.pictureBoxDraw.Image = tempImage;
            parentForm.LastFrame = DateTime.Now;
            parentForm.pictureBoxDraw.Cursor = Cursors.Cross;
        }
    }

    public override void MouseUp(MouseEventArgs e)
    {
        if (e.Button == MouseButtons.Left)
        {
            parentForm.PickedColor = PickedColor;
            parentForm.DialogResult = DialogResult.OK;
        }
        else
        {
            parentForm.DialogResult = DialogResult.Cancel;
        }
    }

    public Bitmap DrawOverlay()
    {

        if (ImageSource == null)
        {
            Debug.WriteLine("Image source is null");
            return new Bitmap(10, 10);
        }

        DrawOutputBmp.DisposeAndNull();
        DrawOutputBmp = new Bitmap(parentForm.Width, parentForm.Height);

        drawGraphic.DisposeAndNull();
        drawGraphic = Graphics.FromImage(DrawOutputBmp);

        ImageRect = new Rectangle(0, 0, ImageSource.Width, ImageSource.Height);

        Point mouseLocal = new(Cursor.Position.X - ScreenBounds.X, Cursor.Position.Y - ScreenBounds.Y);

        if (ImageRect.Contains(mouseLocal))
        {
            PickedColor = ImageSource.GetPixel(mouseLocal.X, mouseLocal.Y);
            //Debug.WriteLine($"Picked color: {PickedColor}");
        }
        else
        {
            Debug.WriteLine($"Cursor is out of bounds, cursor local: {mouseLocal}, screen: {ScreenBounds} in image: {ImageRect}");
        }
        Rectangle infoRect = new Rectangle(mouseLocal.X + 30, mouseLocal.Y + 30, 140, 190);
        drawGraphic.FillRectangle(brushHelpBG, infoRect);
        drawGraphic.FillRectangle(new SolidBrush(PickedColor), new Rectangle(infoRect.X + 10, infoRect.Y + 10, 120, 120));
        string R = PickedColor.R.ToString().PadLeft(3);
        string G = PickedColor.G.ToString().PadLeft(3);
        string B = PickedColor.B.ToString().PadLeft(3);
        drawGraphic.DrawString($"R: {R} G:{G} B:{B}", font, textBrush, new Point(infoRect.X + 5, infoRect.Y + 135));
        drawGraphic.DrawString("Click to confirm\nEsc: Cancel", font, textBrush, new Point(infoRect.X + 5, infoRect.Y + 155));

        return DrawOutputBmp;
    }

    public override void HandleKeys(KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Escape)
        {
            Debug.WriteLine("Exiting ImageView");
            parentForm.isClosing = true;
            parentForm.DialogResult = DialogResult.Cancel;
        }
    }
}
