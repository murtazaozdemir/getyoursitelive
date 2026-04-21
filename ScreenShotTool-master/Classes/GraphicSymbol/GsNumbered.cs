using ScreenShotTool.Properties;
using Font = System.Drawing.Font;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
public class GsNumbered : GraphicSymbol
{
    public bool AutoNumber = true;
    //public int Number = 0;
    public string Text = "";
    private readonly FontFamily fontFamily = FontFamily.GenericSansSerif;
    private float fontEmSize = 12f;
    private readonly FontStyle fontStyle = FontStyle.Bold;
    private Font font;
    private readonly SolidBrush fontBrush = new(Color.White);
    private readonly SolidBrush circleBrush = new(Color.Maroon);
    public int Diameter = 30; // update DefaultRadius if you change Diameter here
    //public int DefaultRadius = 15;

    private GsNumbered(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled, int lineWeight = 1) : base(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
    {
        Name = "Number";
        Diameter = Settings.Default.GsNumberedDefaultSize;
        font = CreateFont();
        FillColor = Settings.Default.GsNumberedColor; //Color.Maroon;
        LineColor = ColorTools.GetTextColorFromBackground(FillColor);
        ValidSymbol = true;
        AllowClickPlacement = true;
    }

    public static GsNumbered Create(Point startPoint, int Size, bool shadow)
    {
        GsNumbered newSymbol = new GsNumbered(startPoint, new Point(Size, Size), Color.Black, Color.Gray, shadow); // these colors aren't used
        return newSymbol;
    }

    internal override void DrawShape(Graphics graphic, Pen drawPen, Brush drawBrush, Point offset, bool fill = true, bool outline = true)
    {
        fontEmSize = Diameter / 2.5f;
        font = CreateFont();
        circleBrush.Color = FillColor;
        fontBrush.Color = LineColor;
        string text = Text; //Number.ToString();
        graphic.FillEllipse(circleBrush, new Rectangle(Left, Top, Diameter, Diameter));
        SizeF sizeInPixels = graphic.MeasureString(text, font);
        int WidthToSpare = Diameter - (int)sizeInPixels.Width;
        int HeightToSpare = Diameter - (int)sizeInPixels.Height;
        graphic.DrawString(text, font, fontBrush, new PointF(Left + offset.X + (WidthToSpare / 2), Top + offset.Y + (HeightToSpare / 2)));
    }

    public override void DrawShadow(Graphics graphic)
    {
        if (ShadowEnabled)
        {
            //for (int i = 1; i < ShadowDistance && i < Diameter / 4; i++)
            //{
            //    // fill
            //    graphic.FillEllipse(ShadowBrush, new Rectangle(Left + i, Top + i, Diameter, Diameter));
            //}
            int adjustedShadowDistance = Math.Min(ShadowDistance, Width / 5);
            graphic.FillEllipse(ShadowBrush, new Rectangle(Left + adjustedShadowDistance, Top + adjustedShadowDistance, Diameter, Diameter));
        }

    }

    private Font CreateFont()
    {
        return new Font(fontFamily, fontEmSize, fontStyle);
    }

    public override int Width
    {
        get
        {
            return Diameter;
        }
        set
        {
            Diameter = value;
        }
    }

    public override int Height
    {
        get
        {
            return Diameter;
        }
    }
}
