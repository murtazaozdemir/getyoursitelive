namespace ScreenShotTool;

public class SymbolProcessing
{
    public static Point RestrainProportions(Point symbolLocation, Point MousePosition, Size originalSize)
    {
        float aspectRatio;
        if (originalSize.Width == 0 || originalSize.Height == 0)
        {
            aspectRatio = 1; // avoid div0
        }
        else
        {
            aspectRatio = (float)originalSize.Width / (float)originalSize.Height;
        }
        Size dragSize = (Size)MousePosition.Subtract(symbolLocation);
        int width = Math.Abs(dragSize.Width);
        int height = Math.Abs(dragSize.Height);
        int xFlip = dragSize.Width < 0 ? -1 : 1;
        int yFlip = dragSize.Height < 0 ? -1 : 1;
        int dominantSide = Math.Max(width, height);
        if (aspectRatio > 1) // scale side by * or / aspect ratio based on what's the longest side
        {
            return new Point((int)(symbolLocation.X + xFlip * dominantSide), (int)(symbolLocation.Y + yFlip * dominantSide / aspectRatio));
        }
        else
        {
            return new Point((int)(symbolLocation.X + xFlip * dominantSide * aspectRatio), (int)(symbolLocation.Y + yFlip * dominantSide));
        }
    }
}
