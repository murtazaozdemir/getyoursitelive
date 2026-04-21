namespace ScreenShotTool;
#pragma warning disable CA1416 // Validate platform compatibility

public static class ColorTools
{
    /// <summary>
    /// Returns the perceived brightness of the input color. Green has the largest impact on brightness.
    /// </summary>
    /// <param name="color">The input color to test</param>
    /// <returns>A perceived brightness of 0 to 1</returns>
    public static float ColorBrightness(Color color)
    {
        // returns a value of 0-1f based on the total perceived brightness of the input color
        //https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
        //https://en.wikipedia.org/wiki/Relative_luminance
        //perceived value (0.2126 * R + 0.7152 * G + 0.0722 * B)
        float pR = 0.2126f;
        float pG = 0.7152f;
        float pB = 0.0722f;
        float result = ((color.R * pR) + (color.G * pG) + (color.B * pB)) / 256f;
        return result;
    }

    public static Color GetTextColorFromBackground(Color backColor, float brightnessThreshold = 0.6f, int alphaThreshold = 128)
    {
        return GetTextColorFromBackground(backColor, Color.Black, Color.White, brightnessThreshold, alphaThreshold);
    }

    public static Color GetTextColorFromBackground(Color backColor, Color DarkColor, Color BrightColor, float brightnessThreshold = 0.6f, int alphaThreshold = 128)
    {
        if (ColorTools.ColorBrightness(backColor) < brightnessThreshold && backColor.A > alphaThreshold)
        {
            return BrightColor;
        }
        else
        {
            return DarkColor;
        }
    }

    public static void SetButtonColors(Button button, Color BackColor, bool setColorName = false)
    {
        button.BackColor = BackColor;
        button.ForeColor = ColorTools.GetTextColorFromBackground(BackColor);
        if (setColorName)
        {
            button.Text = BackColor.Name;
        }
    }

    public static void SetButtonColors(Button button, Color BackColor, string transparentName, bool setColorName = false)
    {
        button.BackColor = BackColor;
        button.ForeColor = ColorTools.GetTextColorFromBackground(BackColor);
        if (BackColor == Color.Transparent)
        {
            button.Text = transparentName;
        }
        else
        {
            if (setColorName)
            {
                button.Text = BackColor.Name;
            }
            else
            {
                button.Text = "";
            }
        }
    }

    /// <summary>
    /// Converts a Color to Hue Saturation and Value (Brightness)
    /// </summary>
    /// <param name="color">ARGB Color</param>
    /// <param name="hue">Hue, 0 to 360</param>
    /// <param name="saturation">Saturation, 0 to 1</param>
    /// <param name="value">Brighness/Value, 0 to 1</param>
    public static void ColorToHSV(Color color, out double hue, out double saturation, out double value)
    {
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        int min = Math.Min(color.R, Math.Min(color.G, color.B));

        hue = color.GetHue();
        saturation = (max == 0) ? 0 : 1d - (1d * min / max);
        value = max / 255d;
    }

    /// <summary>
    /// Converts Hue, Saturation and Value to ARGB Color
    /// </summary>
    /// <param name="hue">0 to 360</param>
    /// <param name="saturation">0 to 1</param>
    /// <param name="value">0 to 1</param>
    /// <returns></returns>
    public static Color ColorFromHSV(double hue, double saturation, double value)
    {
        //https://stackoverflow.com/questions/1335426/is-there-a-built-in-c-net-system-api-for-hsv-to-rgb
        //https://en.wikipedia.org/wiki/HSL_and_HSV
        int hi = Convert.ToInt32(Math.Floor(hue / 60)) % 6;
        double f = hue / 60 - Math.Floor(hue / 60);

        value = value * 255;
        int v = Convert.ToInt32(value);
        int p = Convert.ToInt32(value * (1 - saturation));
        int q = Convert.ToInt32(value * (1 - f * saturation));
        int t = Convert.ToInt32(value * (1 - (1 - f) * saturation));

        if (hi == 0)
            return Color.FromArgb(255, v, t, p);
        else if (hi == 1)
            return Color.FromArgb(255, q, v, p);
        else if (hi == 2)
            return Color.FromArgb(255, p, v, t);
        else if (hi == 3)
            return Color.FromArgb(255, p, q, v);
        else if (hi == 4)
            return Color.FromArgb(255, t, p, v);
        else
            return Color.FromArgb(255, v, p, q);
    }

    public static Color MixColors(Color color1, Color color2, int Alpha)
    {
        float amount = Alpha / 255f;
        return Color.FromArgb(
            (int)float.Lerp(color1.A, color2.A, amount),
            (int)float.Lerp(color1.R, color2.R, amount),
            (int)float.Lerp(color1.G, color2.G, amount),
            (int)float.Lerp(color1.B, color2.B, amount)
            );
    }
}
