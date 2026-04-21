namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsImageScaled : GraphicSymbol
{
    readonly Image? image;

    public GsImageScaled(Point startPoint, Point endPoint, bool shadow) : base(startPoint, endPoint, shadow)
    {
        Name = "Scaled Image";
        Width = endPoint.X;
        Height = endPoint.Y;

        if (image == null)
        {
            image = Clipboard.GetImage();
        }
        if (image == null)
        {
            ValidSymbol = false;
            //Debug.WriteLine("Image load from clipboard failed, not a valid symbol");
        }
        else if (Width < 1 || Height < 1)
        {
            ValidSymbol = false;
            //Debug.WriteLine("Size is 0, not a valid symbol");
        }
        else
        {
            ValidSymbol = true;
        }
    }

    public override Point StartPoint { get { return new Point(Left, Top); } set { Left = value.X; Top = value.Y; } }
    public override Point EndPoint { get { return new Point(Right, Bottom); } set { Right = value.X; Bottom = value.Y; } }

    //public override void DrawSymbol(Graphics graphic)
    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        if (image != null)
        {
            graphic.DrawImage(image, Left, Top, Width, Height);
        }
    }

    public override void DrawShadow(Graphics graphic)
    {
        if (ShadowEnabled)
        {
            for (int i = 1; i < ShadowDistance; i++)
            {
                graphic.FillRectangle(ShadowBrush, new Rectangle(Left + i, Top + i, Width, Height));
            }
        }
    }

    public override void DisposeImages()
    {
        image?.Dispose();
    }
}

