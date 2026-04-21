using System.Collections;
using System.Runtime.Versioning;

namespace ScreenShotTool.Classes
{
    [SupportedOSPlatform("windows")]
    internal class CompareByIndex(ListView listView) : IComparer
    {
        // from https://stackoverflow.com/questions/7913455/inserting-an-item-into-a-c-sharp-winforms-listview
        private readonly ListView _listView = listView;

        public int Compare(object? x, object? y)
        {
            if (x == null || y == null) return 0;
            int i = this._listView.Items.IndexOf((ListViewItem)x);
            int j = this._listView.Items.IndexOf((ListViewItem)y);
            return i - j;
        }
    }
}
