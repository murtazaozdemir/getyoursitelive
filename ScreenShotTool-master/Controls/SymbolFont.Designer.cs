namespace ScreenShotTool.Controls
{
    partial class SymbolFont
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

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            panelPropertiesText = new Panel();
            label1 = new Label();
            comboBoxTextRenderingHint = new ComboBox();
            buttonPropertiesEditText = new Button();
            checkBoxUnderline = new CheckBox();
            checkBoxStrikeout = new CheckBox();
            checkBoxFontItalic = new CheckBox();
            checkBoxFontBold = new CheckBox();
            label16 = new Label();
            label15 = new Label();
            numericPropertiesFontSize = new NumericUpDown();
            comboBoxFontFamily = new ComboBox();
            textBoxSymbolText = new TextBox();
            panelPropertiesText.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericPropertiesFontSize).BeginInit();
            SuspendLayout();
            // 
            // panelPropertiesText
            // 
            panelPropertiesText.BorderStyle = BorderStyle.FixedSingle;
            panelPropertiesText.Controls.Add(label1);
            panelPropertiesText.Controls.Add(comboBoxTextRenderingHint);
            panelPropertiesText.Controls.Add(buttonPropertiesEditText);
            panelPropertiesText.Controls.Add(checkBoxUnderline);
            panelPropertiesText.Controls.Add(checkBoxStrikeout);
            panelPropertiesText.Controls.Add(checkBoxFontItalic);
            panelPropertiesText.Controls.Add(checkBoxFontBold);
            panelPropertiesText.Controls.Add(label16);
            panelPropertiesText.Controls.Add(label15);
            panelPropertiesText.Controls.Add(numericPropertiesFontSize);
            panelPropertiesText.Controls.Add(comboBoxFontFamily);
            panelPropertiesText.Controls.Add(textBoxSymbolText);
            panelPropertiesText.Dock = DockStyle.Fill;
            panelPropertiesText.Location = new Point(0, 0);
            panelPropertiesText.Name = "panelPropertiesText";
            panelPropertiesText.Size = new Size(170, 211);
            panelPropertiesText.TabIndex = 103;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(5, 164);
            label1.Name = "label1";
            label1.Size = new Size(116, 15);
            label1.TabIndex = 47;
            label1.Text = "Text rendering mode";
            // 
            // comboBoxTextRenderingHint
            // 
            comboBoxTextRenderingHint.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxTextRenderingHint.FormattingEnabled = true;
            comboBoxTextRenderingHint.Items.AddRange(new object[] { "SystemDefault", "ClearTypeGridFit", "AntiAliasGridFit", "AntiAlias", "SingleBitPerPixelGridFit", "SingleBitPerPixel" });
            comboBoxTextRenderingHint.Location = new Point(2, 182);
            comboBoxTextRenderingHint.Name = "comboBoxTextRenderingHint";
            comboBoxTextRenderingHint.Size = new Size(162, 23);
            comboBoxTextRenderingHint.TabIndex = 46;
            // 
            // buttonPropertiesEditText
            // 
            buttonPropertiesEditText.Location = new Point(133, 22);
            buttonPropertiesEditText.Name = "buttonPropertiesEditText";
            buttonPropertiesEditText.Size = new Size(32, 23);
            buttonPropertiesEditText.TabIndex = 39;
            buttonPropertiesEditText.Text = "...";
            buttonPropertiesEditText.UseVisualStyleBackColor = true;
            // 
            // checkBoxUnderline
            // 
            checkBoxUnderline.AutoSize = true;
            checkBoxUnderline.Location = new Point(75, 140);
            checkBoxUnderline.Name = "checkBoxUnderline";
            checkBoxUnderline.Size = new Size(77, 19);
            checkBoxUnderline.TabIndex = 45;
            checkBoxUnderline.Text = "Underline";
            checkBoxUnderline.UseVisualStyleBackColor = true;
            // 
            // checkBoxStrikeout
            // 
            checkBoxStrikeout.AutoSize = true;
            checkBoxStrikeout.Location = new Point(5, 140);
            checkBoxStrikeout.Name = "checkBoxStrikeout";
            checkBoxStrikeout.Size = new Size(73, 19);
            checkBoxStrikeout.TabIndex = 44;
            checkBoxStrikeout.Text = "Strikeout";
            checkBoxStrikeout.UseVisualStyleBackColor = true;
            // 
            // checkBoxFontItalic
            // 
            checkBoxFontItalic.AutoSize = true;
            checkBoxFontItalic.Location = new Point(75, 121);
            checkBoxFontItalic.Name = "checkBoxFontItalic";
            checkBoxFontItalic.Size = new Size(51, 19);
            checkBoxFontItalic.TabIndex = 43;
            checkBoxFontItalic.Text = "Italic";
            checkBoxFontItalic.UseVisualStyleBackColor = true;
            // 
            // checkBoxFontBold
            // 
            checkBoxFontBold.AutoSize = true;
            checkBoxFontBold.Location = new Point(5, 121);
            checkBoxFontBold.Name = "checkBoxFontBold";
            checkBoxFontBold.Size = new Size(50, 19);
            checkBoxFontBold.TabIndex = 42;
            checkBoxFontBold.Text = "Bold";
            checkBoxFontBold.UseVisualStyleBackColor = true;
            // 
            // label16
            // 
            label16.AutoSize = true;
            label16.Location = new Point(4, 5);
            label16.Name = "label16";
            label16.Size = new Size(77, 15);
            label16.TabIndex = 30;
            label16.Text = "Text contents";
            // 
            // label15
            // 
            label15.AutoSize = true;
            label15.Location = new Point(3, 72);
            label15.Name = "label15";
            label15.Size = new Size(54, 15);
            label15.TabIndex = 29;
            label15.Text = "Font Size";
            // 
            // numericPropertiesFontSize
            // 
            numericPropertiesFontSize.Location = new Point(109, 70);
            numericPropertiesFontSize.Maximum = new decimal(new int[] { 200, 0, 0, 0 });
            numericPropertiesFontSize.Minimum = new decimal(new int[] { 5, 0, 0, 0 });
            numericPropertiesFontSize.Name = "numericPropertiesFontSize";
            numericPropertiesFontSize.Size = new Size(55, 23);
            numericPropertiesFontSize.TabIndex = 40;
            numericPropertiesFontSize.Value = new decimal(new int[] { 10, 0, 0, 0 });
            // 
            // comboBoxFontFamily
            // 
            comboBoxFontFamily.FormattingEnabled = true;
            comboBoxFontFamily.Location = new Point(2, 96);
            comboBoxFontFamily.Name = "comboBoxFontFamily";
            comboBoxFontFamily.Size = new Size(162, 23);
            comboBoxFontFamily.TabIndex = 41;
            // 
            // textBoxSymbolText
            // 
            textBoxSymbolText.Location = new Point(4, 23);
            textBoxSymbolText.Multiline = true;
            textBoxSymbolText.Name = "textBoxSymbolText";
            textBoxSymbolText.Size = new Size(123, 41);
            textBoxSymbolText.TabIndex = 38;
            // 
            // SymbolFont
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panelPropertiesText);
            Name = "SymbolFont";
            Size = new Size(170, 211);
            panelPropertiesText.ResumeLayout(false);
            panelPropertiesText.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericPropertiesFontSize).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panelPropertiesText;
        private Label label16;
        private Label label15;
        internal Button buttonPropertiesEditText;
        internal CheckBox checkBoxUnderline;
        internal CheckBox checkBoxStrikeout;
        internal CheckBox checkBoxFontItalic;
        internal CheckBox checkBoxFontBold;
        internal NumericUpDown numericPropertiesFontSize;
        internal ComboBox comboBoxFontFamily;
        internal TextBox textBoxSymbolText;
        private Label label1;
        internal ComboBox comboBoxTextRenderingHint;
    }
}
