using System.Diagnostics;

namespace ScreenShotTool.Classes;
#pragma warning disable CA1416 // Validate platform compatibility

public class SharedBitmap
{

    private Bitmap? bitmap;
    public bool isDisposed = true;

    public SharedBitmap()
    {
        isDisposed = true;
    }

    public SharedBitmap(Bitmap bitmap)
    {
        this.bitmap = bitmap;
        this.isDisposed = false;
    }

    public void SetImage(Bitmap? bitmap)
    {
        DisposeImage();
        Debug.WriteLine("Set shared bitmap");
        ArgumentNullException.ThrowIfNull(bitmap);
        this.bitmap = bitmap;
        isDisposed = false;
    }

    public Bitmap? GetBitmap()
    {
        if (!isDisposed) return bitmap;
        return null;
    }

    public void DisposeImage()
    {
        Debug.WriteLine("Dispose shared bitmap");
        if (isDisposed) return;
        isDisposed = true;
        bitmap?.Dispose();
        bitmap = null;
    }

    public int Width
    {
        get
        {
            if (isDisposed) return 0;
            if (bitmap == null) return 0;
            return bitmap.Width;
        }
    }

    public int Height
    {
        get
        {
            if (isDisposed) return 0;
            if (bitmap == null) return 0;
            return bitmap.Height;
        }
    }
}
