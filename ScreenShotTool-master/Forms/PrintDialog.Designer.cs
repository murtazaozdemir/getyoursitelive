namespace ScreenShotTool.Forms
{
    partial class PrintDialog
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
            label1 = new Label();
            comboBoxPrinters = new ComboBox();
            label2 = new Label();
            comboBoxPaper = new ComboBox();
            label3 = new Label();
            numericMarginLeft = new NumericUpDown();
            numericMarginTop = new NumericUpDown();
            label4 = new Label();
            buttonPrint = new Button();
            buttonCancel = new Button();
            numericImageScale = new NumericUpDown();
            label5 = new Label();
            checkBoxFitToPage = new CheckBox();
            label6 = new Label();
            numericMarginRight = new NumericUpDown();
            numericMarginBottom = new NumericUpDown();
            label7 = new Label();
            label8 = new Label();
            pictureBoxPreview = new PictureBox();
            ((System.ComponentModel.ISupportInitialize)numericMarginLeft).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginTop).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericImageScale).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginRight).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginBottom).BeginInit();
            ((System.ComponentModel.ISupportInitialize)pictureBoxPreview).BeginInit();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(12, 21);
            label1.Name = "label1";
            label1.Size = new Size(42, 15);
            label1.TabIndex = 0;
            label1.Text = "Printer";
            // 
            // comboBoxPrinters
            // 
            comboBoxPrinters.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxPrinters.FormattingEnabled = true;
            comboBoxPrinters.Location = new Point(108, 18);
            comboBoxPrinters.Name = "comboBoxPrinters";
            comboBoxPrinters.Size = new Size(147, 23);
            comboBoxPrinters.TabIndex = 1;
            comboBoxPrinters.SelectedIndexChanged += ComboBoxPrinters_SelectedIndexChanged;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(12, 56);
            label2.Name = "label2";
            label2.Size = new Size(60, 15);
            label2.TabIndex = 2;
            label2.Text = "Paper Size";
            // 
            // comboBoxPaper
            // 
            comboBoxPaper.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxPaper.FormattingEnabled = true;
            comboBoxPaper.Location = new Point(108, 53);
            comboBoxPaper.Name = "comboBoxPaper";
            comboBoxPaper.Size = new Size(147, 23);
            comboBoxPaper.TabIndex = 3;
            comboBoxPaper.SelectedIndexChanged += ComboBoxPaper_SelectedIndexChanged;
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(45, 108);
            label3.Name = "label3";
            label3.Size = new Size(27, 15);
            label3.TabIndex = 4;
            label3.Text = "Left";
            // 
            // numericMarginLeft
            // 
            numericMarginLeft.Location = new Point(108, 106);
            numericMarginLeft.Maximum = new decimal(new int[] { 45, 0, 0, 0 });
            numericMarginLeft.Name = "numericMarginLeft";
            numericMarginLeft.Size = new Size(66, 23);
            numericMarginLeft.TabIndex = 5;
            numericMarginLeft.ValueChanged += NumericChanged;
            // 
            // numericMarginTop
            // 
            numericMarginTop.Location = new Point(108, 132);
            numericMarginTop.Maximum = new decimal(new int[] { 45, 0, 0, 0 });
            numericMarginTop.Name = "numericMarginTop";
            numericMarginTop.Size = new Size(66, 23);
            numericMarginTop.TabIndex = 7;
            numericMarginTop.ValueChanged += NumericChanged;
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(45, 134);
            label4.Name = "label4";
            label4.Size = new Size(26, 15);
            label4.TabIndex = 6;
            label4.Text = "Top";
            // 
            // buttonPrint
            // 
            buttonPrint.DialogResult = DialogResult.OK;
            buttonPrint.Location = new Point(243, 295);
            buttonPrint.Name = "buttonPrint";
            buttonPrint.Size = new Size(75, 23);
            buttonPrint.TabIndex = 8;
            buttonPrint.Text = "Print";
            buttonPrint.UseVisualStyleBackColor = true;
            // 
            // buttonCancel
            // 
            buttonCancel.DialogResult = DialogResult.Cancel;
            buttonCancel.Location = new Point(162, 295);
            buttonCancel.Name = "buttonCancel";
            buttonCancel.Size = new Size(75, 23);
            buttonCancel.TabIndex = 9;
            buttonCancel.Text = "Cancel";
            buttonCancel.UseVisualStyleBackColor = true;
            // 
            // numericImageScale
            // 
            numericImageScale.Location = new Point(108, 174);
            numericImageScale.Maximum = new decimal(new int[] { 1000, 0, 0, 0 });
            numericImageScale.Minimum = new decimal(new int[] { 10, 0, 0, 0 });
            numericImageScale.Name = "numericImageScale";
            numericImageScale.Size = new Size(66, 23);
            numericImageScale.TabIndex = 10;
            numericImageScale.Value = new decimal(new int[] { 300, 0, 0, 0 });
            numericImageScale.ValueChanged += NumericImageScale_ValueChanged;
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Location = new Point(12, 176);
            label5.Name = "label5";
            label5.Size = new Size(70, 15);
            label5.TabIndex = 11;
            label5.Text = "Image Scale";
            // 
            // checkBoxFitToPage
            // 
            checkBoxFitToPage.AutoSize = true;
            checkBoxFitToPage.Checked = true;
            checkBoxFitToPage.CheckState = CheckState.Checked;
            checkBoxFitToPage.Location = new Point(12, 203);
            checkBoxFitToPage.Name = "checkBoxFitToPage";
            checkBoxFitToPage.Size = new Size(116, 19);
            checkBoxFitToPage.TabIndex = 12;
            checkBoxFitToPage.Text = "Shrink to fit page";
            checkBoxFitToPage.UseVisualStyleBackColor = true;
            checkBoxFitToPage.CheckedChanged += CheckBoxFitToPage_CheckedChanged;
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Location = new Point(190, 108);
            label6.Name = "label6";
            label6.Size = new Size(35, 15);
            label6.TabIndex = 13;
            label6.Text = "Right";
            // 
            // numericMarginRight
            // 
            numericMarginRight.Location = new Point(246, 106);
            numericMarginRight.Maximum = new decimal(new int[] { 45, 0, 0, 0 });
            numericMarginRight.Name = "numericMarginRight";
            numericMarginRight.Size = new Size(66, 23);
            numericMarginRight.TabIndex = 14;
            numericMarginRight.ValueChanged += NumericChanged;
            // 
            // numericMarginBottom
            // 
            numericMarginBottom.Location = new Point(246, 132);
            numericMarginBottom.Maximum = new decimal(new int[] { 45, 0, 0, 0 });
            numericMarginBottom.Name = "numericMarginBottom";
            numericMarginBottom.Size = new Size(66, 23);
            numericMarginBottom.TabIndex = 16;
            numericMarginBottom.ValueChanged += NumericChanged;
            // 
            // label7
            // 
            label7.AutoSize = true;
            label7.Location = new Point(190, 134);
            label7.Name = "label7";
            label7.Size = new Size(47, 15);
            label7.TabIndex = 15;
            label7.Text = "Bottom";
            // 
            // label8
            // 
            label8.AutoSize = true;
            label8.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            label8.Location = new Point(12, 83);
            label8.Name = "label8";
            label8.Size = new Size(141, 15);
            label8.TabIndex = 17;
            label8.Text = "Page margins in percent";
            // 
            // pictureBoxPreview
            // 
            pictureBoxPreview.BorderStyle = BorderStyle.FixedSingle;
            pictureBoxPreview.Location = new Point(340, 21);
            pictureBoxPreview.Name = "pictureBoxPreview";
            pictureBoxPreview.Size = new Size(210, 297);
            pictureBoxPreview.TabIndex = 18;
            pictureBoxPreview.TabStop = false;
            // 
            // PrintDialog
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(569, 334);
            Controls.Add(pictureBoxPreview);
            Controls.Add(label8);
            Controls.Add(numericMarginBottom);
            Controls.Add(label7);
            Controls.Add(numericMarginRight);
            Controls.Add(label6);
            Controls.Add(checkBoxFitToPage);
            Controls.Add(label5);
            Controls.Add(numericImageScale);
            Controls.Add(buttonCancel);
            Controls.Add(buttonPrint);
            Controls.Add(numericMarginTop);
            Controls.Add(label4);
            Controls.Add(numericMarginLeft);
            Controls.Add(label3);
            Controls.Add(comboBoxPaper);
            Controls.Add(label2);
            Controls.Add(comboBoxPrinters);
            Controls.Add(label1);
            FormBorderStyle = FormBorderStyle.FixedToolWindow;
            Name = "PrintDialog";
            Text = "Print image";
            ((System.ComponentModel.ISupportInitialize)numericMarginLeft).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginTop).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericImageScale).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginRight).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericMarginBottom).EndInit();
            ((System.ComponentModel.ISupportInitialize)pictureBoxPreview).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private ComboBox comboBoxPrinters;
        private Label label2;
        private ComboBox comboBoxPaper;
        private Label label3;
        private NumericUpDown numericMarginLeft;
        private NumericUpDown numericMarginTop;
        private Label label4;
        private Button buttonPrint;
        private Button buttonCancel;
        private NumericUpDown numericImageScale;
        private Label label5;
        private CheckBox checkBoxFitToPage;
        private Label label6;
        private NumericUpDown numericMarginRight;
        private NumericUpDown numericMarginBottom;
        private Label label7;
        private Label label8;
        private PictureBox pictureBoxPreview;
    }
}