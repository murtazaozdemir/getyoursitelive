using ScreenShotTool.Classes;

namespace ScreenShotTool.Forms
{
    partial class TagView
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            dataGridView1 = new DataGridSpecial(components);
            buttonAddTag = new Button();
            buttonSaveTags = new Button();
            buttonMoveUp = new Button();
            buttonMoveDown = new Button();
            buttonDelete = new Button();
            buttonOnTop = new Button();
            checkBoxMultiSelect = new CheckBox();
            toolTip1 = new ToolTip(components);
            textBoxFilter = new TextBox();
            label1 = new Label();
            ((System.ComponentModel.ISupportInitialize)dataGridView1).BeginInit();
            SuspendLayout();
            // 
            // dataGridView1
            // 
            dataGridView1.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            dataGridView1.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            dataGridView1.Location = new Point(6, 61);
            dataGridView1.MultiSelect = false;
            dataGridView1.Name = "dataGridView1";
            dataGridView1.RowHeadersVisible = false;
            dataGridView1.Size = new Size(603, 399);
            dataGridView1.TabIndex = 0;
            dataGridView1.KeyUp += GridHotkeyCheck;
            // 
            // buttonAddTag
            // 
            buttonAddTag.Location = new Point(6, 6);
            buttonAddTag.Name = "buttonAddTag";
            buttonAddTag.Size = new Size(35, 23);
            buttonAddTag.TabIndex = 1;
            buttonAddTag.Text = "➕";
            toolTip1.SetToolTip(buttonAddTag, "Add tag (Ctrl+Plus)");
            buttonAddTag.UseVisualStyleBackColor = true;
            buttonAddTag.Click += ButtonAddTag_Click;
            // 
            // buttonSaveTags
            // 
            buttonSaveTags.Location = new Point(205, 6);
            buttonSaveTags.Name = "buttonSaveTags";
            buttonSaveTags.Size = new Size(35, 23);
            buttonSaveTags.TabIndex = 2;
            buttonSaveTags.Text = "💾";
            toolTip1.SetToolTip(buttonSaveTags, "Save tag list (Ctrl+S). Also saved automatically on program exit.");
            buttonSaveTags.UseVisualStyleBackColor = true;
            buttonSaveTags.Click += ButtonSaveTags_Click;
            // 
            // buttonMoveUp
            // 
            buttonMoveUp.Location = new Point(47, 6);
            buttonMoveUp.Name = "buttonMoveUp";
            buttonMoveUp.Size = new Size(35, 23);
            buttonMoveUp.TabIndex = 3;
            buttonMoveUp.Text = "🠉";
            toolTip1.SetToolTip(buttonMoveUp, "Move tag up (Ctrl+Comma)");
            buttonMoveUp.UseVisualStyleBackColor = true;
            buttonMoveUp.Click += ButtonMoveUp_Click;
            // 
            // buttonMoveDown
            // 
            buttonMoveDown.Location = new Point(88, 6);
            buttonMoveDown.Name = "buttonMoveDown";
            buttonMoveDown.Size = new Size(35, 23);
            buttonMoveDown.TabIndex = 4;
            buttonMoveDown.Text = "🠋";
            toolTip1.SetToolTip(buttonMoveDown, "Move tag down (Ctrl+Period)");
            buttonMoveDown.UseVisualStyleBackColor = true;
            buttonMoveDown.Click += ButtonMoveDown_Click;
            // 
            // buttonDelete
            // 
            buttonDelete.Location = new Point(129, 6);
            buttonDelete.Name = "buttonDelete";
            buttonDelete.Size = new Size(35, 23);
            buttonDelete.TabIndex = 5;
            buttonDelete.Text = "🗑";
            toolTip1.SetToolTip(buttonDelete, "Delete tag (Ctrl+Del)");
            buttonDelete.UseVisualStyleBackColor = true;
            buttonDelete.Click += ButtonDelete_Click;
            // 
            // buttonOnTop
            // 
            buttonOnTop.Location = new Point(246, 6);
            buttonOnTop.Name = "buttonOnTop";
            buttonOnTop.Size = new Size(35, 23);
            buttonOnTop.TabIndex = 6;
            buttonOnTop.Text = "📌";
            toolTip1.SetToolTip(buttonOnTop, "Pin window in front of other programs");
            buttonOnTop.UseVisualStyleBackColor = true;
            buttonOnTop.Click += ButtonOnTop_Click;
            // 
            // checkBoxMultiSelect
            // 
            checkBoxMultiSelect.AutoSize = true;
            checkBoxMultiSelect.Location = new Point(301, 9);
            checkBoxMultiSelect.Name = "checkBoxMultiSelect";
            checkBoxMultiSelect.Size = new Size(131, 19);
            checkBoxMultiSelect.TabIndex = 7;
            checkBoxMultiSelect.Text = "Multi select allowed";
            checkBoxMultiSelect.UseVisualStyleBackColor = true;
            checkBoxMultiSelect.Click += AllowMultiSelect_Click;
            // 
            // textBoxFilter
            // 
            textBoxFilter.Location = new Point(102, 32);
            textBoxFilter.Name = "textBoxFilter";
            textBoxFilter.Size = new Size(195, 23);
            textBoxFilter.TabIndex = 8;
            textBoxFilter.TextChanged += TextBoxFilter_TextChanged;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(12, 35);
            label1.Name = "label1";
            label1.Size = new Size(84, 15);
            label1.TabIndex = 9;
            label1.Text = "Category Filter";
            // 
            // TagView
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(610, 461);
            Controls.Add(label1);
            Controls.Add(textBoxFilter);
            Controls.Add(checkBoxMultiSelect);
            Controls.Add(buttonOnTop);
            Controls.Add(buttonDelete);
            Controls.Add(buttonMoveDown);
            Controls.Add(buttonMoveUp);
            Controls.Add(buttonSaveTags);
            Controls.Add(buttonAddTag);
            Controls.Add(dataGridView1);
            Name = "TagView";
            Text = "TagView";
            ((System.ComponentModel.ISupportInitialize)dataGridView1).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Button buttonAddTag;
        private DataGridSpecial dataGridView1;
        private Button buttonSaveTags;
        private Button buttonMoveUp;
        private Button buttonMoveDown;
        private Button buttonDelete;
        private Button buttonOnTop;
        private CheckBox checkBoxMultiSelect;
        private ToolTip toolTip1;
        private TextBox textBoxFilter;
        private Label label1;
    }
}