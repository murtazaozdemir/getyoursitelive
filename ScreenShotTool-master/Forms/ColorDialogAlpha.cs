using System.Data;
using System.Diagnostics;

namespace ScreenShotTool.Forms;
#pragma warning disable CA1416 // Validate platform compatibility
public partial class ColorDialogAlpha : Form
{
    readonly int SwatchesHorizontal = 15;
    readonly int SwatchesVertical = 10;
    Size SwatchSize = new(20, 20);
    readonly int swatchPadding = 3;
    public Color Color = Color.White;
    List<Color> colors = [];

    public ColorDialogAlpha(Color startColor)
    {
        InitializeComponent();
        Initialize(startColor);
    }

    public ColorDialogAlpha(Color startColor, Point location)
    {
        Initialize(startColor);
        Location = location;
    }

    private void Initialize(Color startColor)
    {
        Font = new Font(this.Font.FontFamily, 9);
        this.Color = startColor;
        colors = GetAllColors(false);
        SwatchSize.Width = (panelSwatches.Width / SwatchesHorizontal);
        SwatchSize.Height = (panelSwatches.Height / SwatchesVertical);
        UpateColor(this.Color);
        CreateColorSwatches();
    }

    private void CreateColorSwatches()
    {
        int swatchCount = 0;
        for (int sX = 0; sX < SwatchesHorizontal; sX++)
        {
            for (int sY = 0; sY < SwatchesVertical; sY++)
            {
                Button swatchButton = new()
                {
                    Parent = panelSwatches,
                    Location = new Point((sX * SwatchSize.Width) + swatchPadding, (sY * (SwatchSize.Height) + swatchPadding)),
                    Size = SwatchSize,
                    FlatStyle = FlatStyle.Flat,
                };
                swatchButton.Click += ClickSwatch;
                Color newColor = Color.Black;
                if (swatchCount < colors.Count)
                {
                    newColor = colors[swatchCount];
                }
                swatchButton.BackColor = newColor;
                if (newColor == Color.Transparent) swatchButton.Text = "T";
                panelSwatches.Controls.Add(swatchButton);
                swatchCount++;
            }
        }
    }

    private static List<Color> GetAllColors(bool includeUIColors)
    {
        List<Color> colorList = [];
        List<Color> rearrangedColors = [];
        ColorConverter converter = new();
        int colorCount = 0;
        var StandardValues = converter.GetStandardValues();
        if (StandardValues != null)
        {
            foreach (Color color in StandardValues)
            {
                if (includeUIColors == false)
                {
                    if (color.Name.Contains("Active")) continue;
                    if (color.Name.Contains("Inactive")) continue;
                    if (color.Name.Contains("Control")) continue;
                    if (color.Name.Contains("Button")) continue;
                    if (color.Name.Contains("Gradient")) continue;
                    if (color.Name.Contains("Text")) continue;
                    if (color.Name.Contains("Menu")) continue;
                    if (color.Name.Contains("Desktop")) continue;
                    if (color.Name.Contains("Window")) continue;
                }
                colorList.Add(color);
                colorCount++;
            }
            MoveToList(colorList, rearrangedColors, Color.Transparent);
            MoveToList(colorList, rearrangedColors, Color.Black);
            MoveToList(colorList, rearrangedColors, Color.White);
            MoveToList(colorList, rearrangedColors, Color.LightGray);
            MoveToList(colorList, rearrangedColors, Color.Gray);
            MoveToList(colorList, rearrangedColors, Color.DarkGray);
            MoveToList(colorList, rearrangedColors, Color.Red);
            MoveToList(colorList, rearrangedColors, Color.Green);
            MoveToList(colorList, rearrangedColors, Color.Blue);
            MoveToList(colorList, rearrangedColors, Color.Yellow);
            MoveToList(colorList, rearrangedColors, Color.Orange);
            rearrangedColors.AddRange(OrderColorByHue(colorList));
        }
        else
        {
            Debug.WriteLine("GetStandardValues returned empty list");
        }
        return rearrangedColors;
    }

    private static List<Color> OrderColorByHue(List<Color> colors)
    {
        // https://stackoverflow.com/questions/62203098/c-sharp-how-do-i-order-a-list-of-colors-in-the-order-of-a-rainbow
        var orderedColorList = colors
            .OrderBy(color => color.GetHue())
            .ThenBy(o => o.R * 3 + o.G * 2 + o.B * 1);
        return [.. orderedColorList];
    }

    private static void MoveToList(List<Color> oldList, List<Color> newList, Color moveColor)
    {
        oldList.Remove(moveColor);
        newList.Add(moveColor);
    }

    private void ClickSwatch(object? sender, EventArgs e)
    {
        if (sender is Button button)
        {
            UpateColor(button.BackColor);
        }
    }

    private void TrackbarColorChanged(object sender, EventArgs e)
    {
        if (sender is TrackBar trackBar)
        {
            if (trackBar == trackBarAlpha)
            {
                numericAlpha.Value = trackBarAlpha.Value;
            }
            if (trackBar == trackBarRed)
            {
                numericRed.Value = trackBarRed.Value;
            }
            if (trackBar == trackBarBlue)
            {
                numericBlue.Value = trackBarBlue.Value;
            }
            if (trackBar == trackBarGreen)
            {
                numericGreen.Value = trackBarGreen.Value;
            }
        }
    }

    private void NumericColorChanged(object sender, EventArgs e)
    {
        UpateColor(Color.FromArgb((int)numericAlpha.Value, (int)numericRed.Value, (int)numericGreen.Value, (int)numericBlue.Value));
    }

    private void UpateColor(Color newColor)
    {
        panelColorSampleSolid.BackColor = Color.FromArgb(255, newColor.R, newColor.G, newColor.B);
        if (newColor == Color.Transparent)
        {
            panelColorSampleAlpha.BackColor = Color.Transparent;
        }
        else
        {
            panelColorSampleAlpha.BackColor = newColor;
        }
        trackBarAlpha.Value = newColor.A;
        trackBarRed.Value = newColor.R;
        trackBarGreen.Value = newColor.G;
        trackBarBlue.Value = newColor.B;
        numericAlpha.Value = newColor.A;
        numericRed.Value = newColor.R;
        numericGreen.Value = newColor.G;
        numericBlue.Value = newColor.B;
        Color = newColor;
    }

    private void ButtonOK_Click(object sender, EventArgs e)
    {
        DialogResult = DialogResult.OK;
    }

    private void ButtonCancel_Click(object sender, EventArgs e)
    {
        DialogResult = DialogResult.Cancel;
    }

    private void ButtonColorPicker_Click(object sender, EventArgs e)
    {
        ImageView imgView = ImageView.CreateUsingAllScreens(ImageView.ViewerMode.colorPicker);
        imgView.SetImage();
        DialogResult result = imgView.ShowDialog();
        if (result == DialogResult.OK || result == DialogResult.Yes)
        {
            if (imgView.PickedColor != Color.Empty)
            {
                UpateColor(imgView.PickedColor);
            }
            else
            {
                Debug.WriteLine("Picked color is empty");
            }
        }
    }

    private void ColorDialogAlpha_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Escape)
        {
            DialogResult = DialogResult.Cancel;
        }
    }
}
