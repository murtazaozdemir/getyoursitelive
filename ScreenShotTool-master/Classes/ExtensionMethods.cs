using System.Numerics;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility
#pragma warning disable IDE0059 // Unnecessary assignment of a value
public static class ExtensionMethods
{
    public static Point Subtract(this Point point1, Point point2)
    {
        return new Point(point1.X - point2.X, point1.Y - point2.Y);
    }

    public static Point Addition(this Point point1, Point point2)
    {
        return new Point(point1.X + point2.X, point1.Y + point2.Y);
    }

    public static float DistanceTo(this Point point1, Point point2)
    {
        Vector2 v1 = new(point1.X, point1.Y);
        Vector2 v2 = new(point2.X, point2.Y);
        return Vector2.Distance(v1, v2);
    }

    public static int ValueInt(this NumericUpDown numericUpDown)
    {
        return (int)numericUpDown.Value;
    }

    public static bool SetValueClamped(this NumericUpDown numericUpDown, decimal value)
    {
        numericUpDown.Value = Math.Clamp(value, numericUpDown.Minimum, numericUpDown.Maximum);
        if (value > numericUpDown.Maximum || value < numericUpDown.Minimum)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    public static void DisposeAndNull(this Image? image)
    {
        if (image != null)
        {
            image.Dispose();
            image = null;
        }
    }

    public static void DisposeAndNull(this Bitmap? image)
    {
        if (image != null)
        {
            image.Dispose();
            image = null;
        }
    }

    public static void DisposeAndNull(this Graphics? graphic)
    {
        if (graphic != null)
        {
            graphic.Dispose();
            graphic = null;
        }
    }
}
