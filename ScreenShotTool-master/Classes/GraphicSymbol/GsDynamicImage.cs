namespace ScreenShotTool;

public class GsDynamicImage(Point startPoint, Point endPoint, Color foregroundColor, Color backgroundColor, bool shadowEnabled = false, int lineWeight = 0) : GsBoundingBox(startPoint, endPoint, foregroundColor, backgroundColor, shadowEnabled, lineWeight)
{
    internal Point previousPosition = new(0, 0);
    internal Size previousSize = new(0, 0);
    internal DateTime LastSourceUpdate = DateTime.MinValue;
    private Bitmap? _sourceImage = null;
    public Bitmap? SourceImage
    {
        get
        {
            return _sourceImage;
        }
        set
        {
            LastSourceUpdate = DateTime.Now;
            _sourceImage = value;
        }
    }


    internal bool RectChanged(Rectangle newRect)
    {
        if (previousPosition.X != newRect.X) return true;
        if (previousPosition.Y != newRect.Y) return true;
        if (previousSize.Width != newRect.Width) return true;
        if (previousSize.Height != newRect.Height) return true;
        return false;
    }
}

