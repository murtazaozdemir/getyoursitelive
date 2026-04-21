using System.Collections.Specialized;
using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool
{
    [SupportedOSPlatform("windows")]

    public static class ClipboardHelpers
    {

        public static bool SetFileList(StringCollection fileList, bool errorpopup = true)
        {
            try
            {
                Clipboard.SetFileDropList(fileList);
                return true;
            }
            catch (Exception ex)
            {
                ClipboardErrorMessage(ex, errorpopup);
                return false;
            }
        }

        public static bool SetImage(Image bitmap, bool errorpopup = true)
        {
            try
            {
                Clipboard.SetImage(bitmap);
                return true;
            }
            catch (Exception ex)
            {
                ClipboardErrorMessage(ex, errorpopup);
                return false;
            }
        }

        public static Image? GetImage(bool errorpopup = false)
        {
            try
            {
                return Clipboard.GetImage();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error fetching image from clipboard. Exception: {ex.Message}");
                if (errorpopup) MessageBox.Show($"Error fetching image from clipboard. Exception {ex.Message}");
                return null;
            }
        }

        public static bool ContainsImage()
        {
            try
            {
                return Clipboard.ContainsImage();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error checking clipboard for image. Exception: {ex.Message}");
                return false;
            }
        }

        public static bool ContainsText()
        {
            try
            {
                return Clipboard.ContainsText();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error checking clipboard for text. Exception: {ex.Message}");
                return false;
            }
        }

        public static string GetText()
        {
            try
            {
                return Clipboard.GetText();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error getting clipboard text. Exception: {ex.Message}");
                return string.Empty;
            }
        }

        public static bool Clear()
        {
            try
            {
                Clipboard.Clear();
                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error clearing clipboard. Exception: {ex.Message}");
                return false;
            }
        }

        private static void ClipboardErrorMessage(Exception ex, bool errorpopup)
        {
            Debug.WriteLine($"Error updating clipboard. Please Try again.Exception: {ex.Message}");
            if (errorpopup) MessageBox.Show($"Error updating clipboard. Please Try again.\nThe clipboard may be in use by another application.\n\n{ex.Message}");
        }
    }
}