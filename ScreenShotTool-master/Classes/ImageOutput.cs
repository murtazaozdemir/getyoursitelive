using ScreenShotTool.Properties;
using System.Diagnostics;
using System.Drawing.Imaging;

namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public static class ImageOutput
{
    public const string SupportedImageFormatExtensions = ".png.jpg.jpeg.bmp.gif.webp.tiff.tif";
    public const string FilterLoadImage = "Images|*.png;*.jpg;*.jpeg;*.gif;*.bmp;*.tif;*.tiff;*.webp|PNG|*.png|JPG|*.jpg;*.jpeg|GIF|*.gif|BMP|*.bmp|Tiff|*.tif;*.tiff|Webp|*.webp|All files|*.*";
    public const string FilterSaveImage = "PNG|*.png|JPG|*.jpg|GIF|*.gif|BMP|*.bmp|PDF|*.pdf|Tiff|*.tif|Webp|*.webp|All files|*.*";

    public static (bool result, int filtexIndex) SaveWithDialog(Bitmap outImage, string filter, string filenameSuggestion = "", int filterIndex = 1)
    {
        FileDialog fileDialog = new SaveFileDialog();

        fileDialog.Filter = filter;
        fileDialog.FileName = "";
        fileDialog.FilterIndex = filterIndex;
        if (filenameSuggestion.Length > 0)
        {
            fileDialog.FileName = filenameSuggestion;
        }
        DialogResult result = fileDialog.ShowDialog();
        if (result == DialogResult.OK)
        {
            filterIndex = fileDialog.FilterIndex;
            string filename = fileDialog.FileName;
            if (Path.GetExtension(filename).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                Debug.WriteLine($"Saving to PDF {filename}");
                SaveToPdf.Save(filename, outImage, margins: 20f, imageScale: 0.87f); // 0.87 seems to match real pixels to a 100% zoom in Adobe Reader.
                outImage?.Dispose();
                return (File.Exists(filename), filterIndex);
            }
            else
            {
                ImageFormat imgFormat = ImageFormatFromExtension(filename);
                Debug.WriteLine($"Guessed file format from file name ({filename}): {imgFormat} ");
                SaveImage(fileDialog.FileName, outImage, imgFormat);
                outImage?.Dispose();
                return (File.Exists(filename), filterIndex);
            }
        }
        else
        {
            outImage?.Dispose();
        }
        return (false, filterIndex);
    }

    private static void SaveImage(string filename, Bitmap outImage, ImageFormat imgFormat)
    {
        Debug.WriteLine($"Saving image {filename} with format {imgFormat}");
        //Bitmap? outImage = editorCanvas.AssembleImageForSaveOrCopy();

        //if (Settings.Default.SaveTagsExif)
        //{
        //    PropertyItem tagItem = outImage.PropertyItems[0];
        //    tagItem.Id = 0x9286; // UserComment
        //    tagItem.Type = 2; // string
        //    tagItem.Value = System.Text.Encoding.UTF8.GetBytes("testTag");
        //    tagItem.Len = tagItem.Value.Length;
        //    outImage.SetPropertyItem(tagItem);
        //}

        if (outImage != null && imgFormat == ImageFormat.Jpeg)
        {
            MainForm.SaveJpeg(filename, (Bitmap)outImage, Settings.Default.JpegQuality);
            outImage.Dispose();
        }
        else if (outImage != null)
        {
            outImage.Save(filename, imgFormat);
            outImage.Dispose();
        }
    }

    public static ImageFormat ImageFormatFromExtension(string filename)
    {
        string extension = Path.GetExtension(filename).ToLowerInvariant();
        return extension switch
        {
            ".png" => ImageFormat.Png,
            ".jpg" => ImageFormat.Jpeg,
            ".jpeg" => ImageFormat.Jpeg,
            ".bmp" => ImageFormat.Bmp,
            ".gif" => ImageFormat.Gif,
            ".webp" => ImageFormat.Webp,
            ".tif" => ImageFormat.Tiff,
            ".tiff" => ImageFormat.Tiff,
            _ => ImageFormat.Png,
        };
    }

    public static bool IsSupportedImageFormat(string extension)
    {
        return (SupportedImageFormatExtensions.Contains(extension.ToLowerInvariant()));
    }
}
