namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public class FreehandDrawing
{
    public Bitmap Bitmap;
    private Graphics graphics;
    public Point Location = new Point(0, 0);
    public Size Size;
    private bool noPixelsSet = true;
    public int LeftMostPixel = 0;
    public int RightMostPixel = 0;
    public int TopMostPixel = 0;
    public int BottomMostPixel = 0;
    //public Pen Pen;
    public FreehandDrawing(int Width, int Height)
    {
        //Debug.WriteLine("Create Freehand");
        this.Bitmap = new Bitmap(Width, Height);
        graphics = Graphics.FromImage(this.Bitmap);
        Size = new Size(Width, Height);
        //this.Pen = pen;
    }

    private void UpdateContentBounds(Pen pen, Point point)
    {
        int penRadius = (int)Math.Ceiling(pen.Width / 2f);
        int left = point.X - penRadius;
        int right = point.X + penRadius;
        int top = point.Y - penRadius;
        int bottom = point.Y + penRadius;
        if (noPixelsSet)
        {
            LeftMostPixel = left;
            RightMostPixel = right;
            TopMostPixel = top;
            BottomMostPixel = bottom;
            noPixelsSet = false;
        }
        else
        {
            LeftMostPixel = Math.Min(left, LeftMostPixel);
            RightMostPixel = Math.Max(right, RightMostPixel);
            TopMostPixel = Math.Min(top, TopMostPixel);
            BottomMostPixel = Math.Max(bottom, BottomMostPixel);
        }
    }

    public void DrawLine(Pen pen, Point point1, Point point2)
    {
        UpdateContentBounds(pen, point1);
        UpdateContentBounds(pen, point2);
        graphics.DrawLine(pen, point1, point2);
    }

    public Rectangle Contents
    {
        get
        {
            return new Rectangle(LeftMostPixel, TopMostPixel, RightMostPixel - LeftMostPixel, BottomMostPixel - TopMostPixel);
        }
    }

    public void Dispose()
    {
        this.Bitmap.Dispose();
    }
}
