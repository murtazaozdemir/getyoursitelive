using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.Versioning;

namespace ScreenShotTool.Classes;
[SupportedOSPlatform("windows")]

public partial class DataGridSpecial : DataGridView
{
    public bool AllowCheckboxMultiSelect = true;

    //public DataGridSpecial()
    //{
    //    InitializeComponent();
    //    base.CellMouseUp += CheckboxEndEdit;
    //    Debug.WriteLine($"DataGridViewSpecial created");
    //}

    private void CheckboxEndEdit(object? sender, DataGridViewCellMouseEventArgs e)
    {
        Debug.WriteLine($"DataGrid column index is {e.ColumnIndex}");
        if (e.ColumnIndex < 0 || e.ColumnIndex >= Columns.Count)
        {
            Debug.WriteLine($"Cancel End edit, index is {e.ColumnIndex}");
            return;
        }
        if (Columns[e.ColumnIndex] is DataGridViewCheckBoxColumn)
        {
            Debug.WriteLine($"Ending edit {sender} {e.ColumnIndex}");
            EndEdit();
            Debug.WriteLine($"Multiselect: {AllowCheckboxMultiSelect}");
            if (AllowCheckboxMultiSelect == false)
            {

                if (Rows[e.RowIndex].Cells[e.ColumnIndex] is DataGridViewCheckBoxCell cbCell)
                {
                    Debug.WriteLine($"Checkbox cell: {cbCell.Value}");
                    //Deselect all other checkboxes
                    CheckOnly(e.ColumnIndex, e.RowIndex, (bool)cbCell.Value);
                }
            }
        }
        else
        {
            Debug.WriteLine($"Dont' end edit {sender} {e.ColumnIndex}");
        }
    }

    private void CheckOnly(int column, int row, bool check)
    {
        for (int i = 0; i < Rows.Count; i++)
        {
            if (Rows[i].Cells[column] is DataGridViewCheckBoxCell cb)
            {
                bool match = row == i;
                if (match) match = check;
                cb.Value = match;
            }
        }
    }

    public DataGridSpecial(IContainer container)
    {
        container.Add(this);
        InitializeComponent();
        base.CellMouseUp += CheckboxEndEdit;
        base.CellClick += CellClickCheck;
        Debug.WriteLine($"DataGridViewSpecial created");
    }

    private void CellClickCheck(object? sender, DataGridViewCellEventArgs e)
    {
        Debug.WriteLine($"Clicked {e.RowIndex} {e.ColumnIndex}");
    }
}
