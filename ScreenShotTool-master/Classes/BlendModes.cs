using System.Diagnostics;

namespace ScreenShotTool
{
    public class ColorBlend
    {
        // https://en.wikipedia.org/wiki/Blend_modes

        // Warning, none of these are accurate if the two colors have DIFFERENT alpha values

        // When adding new blend modes:
        // - add an entry to the Control's combobox here: ScreenShotTool\Controls\SymbolBlendMode.Designer.cs
        // - add function call in BlendColors()
        // - if the blend mode has an adjustment value, update HasAdjustmentValue() and in GSHiglight's AdjustmentValue get/set switch
        public enum BlendModes
        {
            None = 0,
            Normal = 1,
            Multiply = 2,
            Divide = 3,
            Lighten = 4,
            Darken = 5,
            Desaturate = 6,
            Invert = 7,
            Average = 8,
            Contrast = 9,
            InvertBrightness = 10,
            Tint = 11,
            TintBrightColors = 12,
            Dither = 13,
        }

        public static bool HasAdjustmentValue(BlendModes blendmode)
        {
            return blendmode switch
            {
                BlendModes.TintBrightColors => true,
                BlendModes.Tint => true,
                BlendModes.Dither => true,
                _ => false
            };
        }

        public static (Color color, object? data) BlendColors(Color color1, Color color2, BlendModes blendmode, int adjustment = 0, object? infoObject = null) //, float AffectChannelRed = 1f, float AffectChannelGreen = 1f, float AffectChannelBlue = 1f)
        {
            return blendmode switch
            {
                BlendModes.None => (color1, null), // keeps the bottom color unchanged
                BlendModes.Normal => (color2, null), // uses the top color unchanged
                BlendModes.Multiply => (Multiply(color1, color2), null), // all colors are darkened by the amount in color2
                BlendModes.Divide => (Divide(color1, color2), null), // this one gets kinda weird
                BlendModes.Lighten => (Lighten(color1, color2), null), // only colors that are darker than color2 are lightened
                BlendModes.Darken => (Darken(color1, color2), null), // only colors that are lighter than color2 are darkened
                BlendModes.Desaturate => (Desaturate(color1, color2), null), // grayscale
                BlendModes.Invert => (Invert(color1), null), // outputs the inverted color, light channels becomes dark, dark becomes light
                BlendModes.InvertBrightness => (InvertBrighness(color1, color2), null),
                BlendModes.Tint => (Tint(color1, color2, adjustment), null),
                BlendModes.TintBrightColors => (TintBrightColors(color1, color2, adjustment), null),
                BlendModes.Average => (Average(color1, color2), null), // same effect as doing Normal with 50% opacity
                BlendModes.Contrast => (Contrast(color1, color2), null),
                BlendModes.Dither => Dither(color1, color2, infoObject, adjustment),
                _ => (color1, null)
            };
        }

        /// <summary>
        /// Dithers an image, outputs fully dark or light pixels using Floyd-Steinberg error diffusion
        /// </summary>
        /// <param name="color1">Image pixel to process</param>
        /// <param name="color2">Color used for the dark pixels</param>
        /// <param name="infoObject">A RowInfo object holding error diffusion data for the current and next row</param>
        /// <param name="threshold">Pixels with a brightness above the threshold are light, below is dark. 0-100: Low gives light images, high gives darker images. Default 50.</param>
        /// <returns></returns>
        private static (Color color, object? error) Dither(Color color1, Color color2, object? infoObject, int threshold)
        {
            // Floyd - Steinberg Dithering

            // the RowInfo/infoObject holds the current error diffusion data for the current and next row, and must be passed from the caller since this is a static function
            // threshold is passed as an int because it is set in a multi-purpose numericUpDown

            if (infoObject is RowInfo info)
            {
                float resultBrightness = 0;
                Color resultColor = color2;
                float pixelError = info.CurrentRow[info.X];
                float brightness = color1.GetBrightness();
                float corrected = (brightness + pixelError); // current brightness plus the remaining error diffusion from previous pixels

                float thresholdNormalized = (threshold * 0.03f) - 1f; // convert threshold input from 0 to 100 into -1 to +2, where 50 is 0.5
                if (corrected > thresholdNormalized)
                {
                    resultBrightness = 1;
                    resultColor = Color.White;
                }
                float returnError = (corrected - resultBrightness) + (brightness - resultBrightness); // use the current error plus remnant from the diffused error so it can build over time
                returnError = Math.Clamp(returnError, -1f, 1f); //  without this the threshold value will be ineffective, as the error keeps being fixed automatically

                // dithering ratio, output error * 1/16th on pixels to the right and below, X is current pixel. Precalculated the fractions into floats.
                //      X   7
                //  3   5   1
                info.CurrentRow[info.X + 1] += returnError * 0.4375f; // 7/16th
                if (info.X > 0) info.NextRow[info.X - 1] += returnError * 0.1875f; // 3/16th
                info.NextRow[info.X] += returnError * 0.3125f; // 3/16th
                info.NextRow[info.X + 1] += returnError * 0.0625f; // 1/16th

                MoveRowInfoHead(info);
                return (resultColor, info);
            }
            else
            {
                throw new InvalidDataException("Error in Dither blend mode: infoObject passed is not of type RowInfo");
            }
        }

        internal static void MoveRowInfoHead(RowInfo info)
        {
            info.X++;
            if (info.X >= info.Width) // at the end of the row, swap in the next array, and update X and Y.
            {
                info.X = 0;
                info.Y++; //  Y is only used for debugging
                info.NextRow.CopyTo(info.CurrentRow, 0);
                info.NextRow = new float[info.Width + 2];
            }
        }

        public static int CombineTransparencies(Color color1, Color color2)
        {
            float a1 = color1.A / 255f;
            float a2 = color2.A / 255f;
            float transparency = a1 * a2;
            int A = (int)(transparency * 255);
            return int.Clamp(A, 0, 255);
        }

        public static int MultiplyColorChannel(int channel1, int channel2)
        {
            float c1 = channel1 / 255f;
            float c2 = channel2 / 255f;
            float mult = c1 * c2;
            int result = (int)(mult * 255);
            return int.Clamp(result, 0, 255);
        }

        public static int DivideColorChannel(int channel1, int channel2)
        {
            float c1 = channel1 / 255f;
            float c2 = channel2 / 255f;
            if (c2 <= 0) return 255;
            float div = c1 / c2;
            int result = (int)(div * 255);
            return int.Clamp(result, 0, 255);
        }

        public static int AverageColorChannel(int channel1, int channel2)
        {
            float c1 = channel1 / 255f;
            float c2 = channel2 / 255f;
            float avg = (c1 + c2) / 2;
            int result = (int)(avg * 255);
            return int.Clamp(result, 0, 255);
        }

        public static int ContrastColorChannel(int channel1, int channel2)
        {
            // https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
            // channel2 is used for contrast amount, gray 128 is unchanged, less becomes grayer, greater is more contrast. Color hues are valid for per-channel contrast.
            // Shifting the channel2/contrast value up so 0 becomes -255, and 255 becomes remains 255, to allow for more or less contrast
            channel2 = (channel2 * 2) - 255;
            float contrast = channel2;
            float factor = (259f * (contrast + 255f)) / (255f * (259f - contrast));
            return (int)Math.Clamp(factor * (channel1 - 128) + 128, 0, 255);
        }

        private static Color Contrast(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, ContrastColorChannel(color1.R, color2.R), ContrastColorChannel(color1.G, color2.G), ContrastColorChannel(color1.B, color2.B));
        }

        public static Color Average(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, AverageColorChannel(color1.R, color2.R), AverageColorChannel(color1.G, color2.G), AverageColorChannel(color1.B, color2.B));
        }

        public static Color Lighten(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, Math.Max((int)color1.R, color2.R), Math.Max((int)color1.G, color2.G), Math.Max((int)color1.B, color2.B));
        }

        public static Color Darken(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, Math.Min((int)color1.R, color2.R), Math.Min((int)color1.G, color2.G), Math.Min((int)color1.B, color2.B));
        }

        public static Color Multiply(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, MultiplyColorChannel(color1.R, color2.R), MultiplyColorChannel(color1.G, color2.G), MultiplyColorChannel(color1.B, color2.B));
        }

        public static Color Divide(Color color1, Color color2)
        {
            int Alpha = CombineTransparencies(color1, color2);
            return Color.FromArgb(Alpha, DivideColorChannel(color1.R, color2.R), DivideColorChannel(color1.G, color2.G), DivideColorChannel(color1.B, color2.B));
        }

        public static Color Desaturate(Color color1, Color color2)
        {
            // uses perceptual brightness to desaturate, blues are much darker than greens.

            //int Alpha = CombineTransparencies(color1, color2);
            int desaturated = (int)(ColorTools.ColorBrightness(color1) * 255f);
            //return Color.FromArgb(Alpha, desaturated, desaturated, desaturated);

            Color outColor = Color.FromArgb(desaturated, desaturated, desaturated);
            return ColorTools.MixColors(color1, outColor, color2.A);
        }

        public static Color DesaturateAverageRGB(Color color1, Color color2)
        {
            // uses an average color, not perceptual, so pure greens are just as dark as blues and reds
            // not in use since there's seldom a desire for this effect.

            int Alpha = CombineTransparencies(color1, color2);
            int avgColor = Math.Clamp((int)((color1.R + color1.G + color1.B) / 3f), 0, 255);
            return Color.FromArgb(Alpha, avgColor, avgColor, avgColor);
        }

        public static Color Invert(Color color1)
        {
            //Inverts the brightness, also inverts the hues, a classic.
            //int Alpha = CombineTransparencies(color1, color2);

            return Color.FromArgb(color1.A, 255 - color1.R, 255 - color1.G, 255 - color1.B);
        }

        public static Color InvertBrighness(Color color1, Color color2)
        {
            // Inverts the image brighness, while maintaining the hue.
            //color1 is the underlying image
            //color2 is used to adjust the brightness of the extremes (dark to light as whites or pure color)
            //color2 RED channel is used to transition between using BRIGHTNESS and PERCEPTUAL BRIGHTNESS
            //color2 GREEN channel is used to transition between using SOURCE SATURATION and IMPROVED SATURATION, allowing for bright colors to move toward whites
            //color2 BLUE channel is not used
            // using RED and GREEN because that matches the default Yellow highlighter values and gives the prettiest result.
            ColorTools.ColorToHSV(color1, out double hue, out double saturation, out double brightness);
            double perceptualBrightness = ColorTools.ColorBrightness(color1);
            double brightnessInvert1 = 1 - brightness;
            double brightnessInvert2 = 1 - perceptualBrightness;

            double finalBrightness = Double.Lerp(brightnessInvert1, brightnessInvert2, color2.R / 255d); // fade between Color.Brightness and perceptual brightness
            double finalSaturation = Double.Lerp(saturation, brightness, color2.G / 255d); // using brightness for saturation allows dark>bright colors to fade into whites

            Color outColor = ColorTools.ColorFromHSV(hue, finalSaturation, finalBrightness);
            return ColorTools.MixColors(color1, outColor, color2.A);
            //return outColor;
        }

        public static Color TintBrightColors(Color color1, Color color2, int adjustment)
        {
            // A variant of Darken, but capping the darkest values of color2 with a Max(adjustment, color2 RGB)
            // useful for colorizing brigh text on a dark bakground, but not applying tint to the background.
            // (or tinting bright backgrounds but not the colored/dark text in front)
            // the higher the adjustment value, the less it will affect brighter colors, but also giving a more washed out color.


            int R2 = Math.Max(adjustment, color2.R);
            int G2 = Math.Max(adjustment, color2.G);
            int B2 = Math.Max(adjustment, color2.B);
            int A = color2.A;
            int R = Math.Min(color1.R, R2);
            int G = Math.Min(color1.G, G2);
            int B = Math.Min(color1.B, B2);
            Color outColor = Color.FromArgb(A, R, G, B);
            return ColorTools.MixColors(color1, outColor, color2.A);
            //int Alpha = CombineTransparencies(color1, color2);
            //return Color.FromArgb(Alpha, R, G, B);
        }

        public static Color Tint(Color color1, Color color2, int adjustment)
        {
            float adjNormalized = Math.Clamp(adjustment / 256f, 0f, 1f);
            // Replaces the hue of color 1 with color2's hue
            // Adjustment 0..1:
            //    0 tints while keeping saturation and value intact (brighter, desaturated and tinted).
            //    1 mutes bright values down to color2's value (like an overlay film)

            ColorTools.ColorToHSV(color1, out _, out double sat1, out double val1);
            ColorTools.ColorToHSV(color2, out double hue2, out double sat2, out double val2);

            //float color2Alpha = ((float)color2.A) / 255f;
            double H = hue2;
            double S = Double.Lerp(sat1, sat2, adjNormalized);
            double V = Math.Min(val1, Double.Lerp(val1, val2, adjNormalized));
            return ColorTools.MixColors(color1, ColorTools.ColorFromHSV(H, S, V), color2.A);
        }


    }
}
