using System.Runtime.Versioning;

namespace ScreenShotTool.Classes;
[SupportedOSPlatform("windows")]

public static class DragDropMethods
{
    public static List<string> GetDroppedFileNames(DragEventArgs e)
    {
        if (e.Data == null) return [];
        if (e.Data.GetData(DataFormats.FileDrop, true) is not string[] fileNames) return [];
        return [.. fileNames];
    }

    public static Point GetDropLocation(DragEventArgs e, Control control)
    {
        return control.PointToClient(new Point(e.X, e.Y));
    }

    public static void FileDropDragEnter(object sender, DragEventArgs e)
    {
        if (e.Data == null) return;
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            e.Effect = DragDropEffects.Copy;
        }
        else
        {
            e.Effect = DragDropEffects.None;
        }
    }
}
