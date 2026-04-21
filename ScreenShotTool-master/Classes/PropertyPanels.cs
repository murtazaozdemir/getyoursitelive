using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool.Classes;
[SupportedOSPlatform("windows")]

internal class PropertyPanels
{
    public List<Control> SymbolControls = [];

    internal void Add(Control control, Control parentPanel)//, Point groupLocation)
    {
        parentPanel.Controls.Add(control);
        SymbolControls.Add(control);
        //control.Left = groupLocation.X;
        //if (SymbolControls.Last() != null)
        //{
        //    control.Top = SymbolControls.Last().Bottom + 5 + (groupLocation.Y);
        //}

        foreach (Control c in control.Controls)
        {
            if (c is Panel p)
            {
                foreach (Control sc in p.Controls)
                {
                    if (sc is NumericUpDown num)
                    {
                        num.KeyPress += SupressEnterDing;
                    }
                }
            }
        }
    }

    private static void SupressEnterDing(object? sender, KeyPressEventArgs e)
    {
        Debug.WriteLine("key pressed");
        if (e.KeyChar == (char)Keys.Enter)
        {
            Debug.WriteLine("no ding please 1");
            e.Handled = true;
            e.KeyChar = '0';
            // this character doesn't actually get sent, since it's after Handled, but will prevent the keypress reacting to Enter, since it no longer is Enter
        }
    }

    private static void SupressDown(object? sender, KeyEventArgs e)
    {
        Debug.WriteLine("key down or up");
        if (e.KeyCode == Keys.Enter)
        {
            Debug.WriteLine("no ding please 2");
            e.Handled = true;
        }
    }
}
