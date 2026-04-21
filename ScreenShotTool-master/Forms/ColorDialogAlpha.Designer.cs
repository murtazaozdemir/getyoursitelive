namespace ScreenShotTool.Forms
{
    partial class ColorDialogAlpha
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
            buttonOK = new Button();
            buttonCancel = new Button();
            trackBarRed = new TrackBar();
            panelColorSampleSolid = new Panel();
            numericRed = new NumericUpDown();
            labelRed = new Label();
            label1 = new Label();
            numericBlue = new NumericUpDown();
            trackBarBlue = new TrackBar();
            label2 = new Label();
            numericAlpha = new NumericUpDown();
            trackBarAlpha = new TrackBar();
            label3 = new Label();
            numericGreen = new NumericUpDown();
            trackBarGreen = new TrackBar();
            panelColorSampleAlpha = new Panel();
            labelColorSolid = new Label();
            label4 = new Label();
            panelSwatches = new Panel();
            buttonColorPicker = new Button();
            ((System.ComponentModel.ISupportInitialize)trackBarRed).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericRed).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericBlue).BeginInit();
            ((System.ComponentModel.ISupportInitialize)trackBarBlue).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericAlpha).BeginInit();
            ((System.ComponentModel.ISupportInitialize)trackBarAlpha).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericGreen).BeginInit();
            ((System.ComponentModel.ISupportInitialize)trackBarGreen).BeginInit();
            SuspendLayout();
            // 
            // buttonOK
            // 
            buttonOK.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
            buttonOK.Location = new Point(213, 415);
            buttonOK.Name = "buttonOK";
            buttonOK.Size = new Size(75, 23);
            buttonOK.TabIndex = 0;
            buttonOK.Text = "OK";
            buttonOK.UseVisualStyleBackColor = true;
            buttonOK.Click += ButtonOK_Click;
            // 
            // buttonCancel
            // 
            buttonCancel.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
            buttonCancel.Location = new Point(294, 414);
            buttonCancel.Name = "buttonCancel";
            buttonCancel.Size = new Size(75, 23);
            buttonCancel.TabIndex = 1;
            buttonCancel.Text = "Cancel";
            buttonCancel.UseVisualStyleBackColor = true;
            buttonCancel.Click += ButtonCancel_Click;
            // 
            // trackBarRed
            // 
            trackBarRed.AutoSize = false;
            trackBarRed.Location = new Point(118, 271);
            trackBarRed.Maximum = 255;
            trackBarRed.Name = "trackBarRed";
            trackBarRed.Size = new Size(122, 28);
            trackBarRed.TabIndex = 2;
            trackBarRed.TickStyle = TickStyle.None;
            trackBarRed.ValueChanged += TrackbarColorChanged;
            // 
            // panelColorSampleSolid
            // 
            panelColorSampleSolid.BackColor = Color.Red;
            panelColorSampleSolid.Location = new Point(260, 276);
            panelColorSampleSolid.Name = "panelColorSampleSolid";
            panelColorSampleSolid.Size = new Size(54, 34);
            panelColorSampleSolid.TabIndex = 6;
            // 
            // numericRed
            // 
            numericRed.Location = new Point(60, 271);
            numericRed.Maximum = new decimal(new int[] { 255, 0, 0, 0 });
            numericRed.Name = "numericRed";
            numericRed.Size = new Size(52, 23);
            numericRed.TabIndex = 7;
            numericRed.ValueChanged += NumericColorChanged;
            // 
            // labelRed
            // 
            labelRed.AutoSize = true;
            labelRed.Location = new Point(27, 273);
            labelRed.Name = "labelRed";
            labelRed.Size = new Size(27, 15);
            labelRed.TabIndex = 8;
            labelRed.Text = "Red";
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(24, 302);
            label1.Name = "label1";
            label1.Size = new Size(30, 15);
            label1.TabIndex = 11;
            label1.Text = "Blue";
            // 
            // numericBlue
            // 
            numericBlue.Location = new Point(60, 300);
            numericBlue.Maximum = new decimal(new int[] { 255, 0, 0, 0 });
            numericBlue.Name = "numericBlue";
            numericBlue.Size = new Size(52, 23);
            numericBlue.TabIndex = 10;
            numericBlue.ValueChanged += NumericColorChanged;
            // 
            // trackBarBlue
            // 
            trackBarBlue.AutoSize = false;
            trackBarBlue.Location = new Point(118, 300);
            trackBarBlue.Maximum = 255;
            trackBarBlue.Name = "trackBarBlue";
            trackBarBlue.Size = new Size(122, 28);
            trackBarBlue.TabIndex = 9;
            trackBarBlue.TickStyle = TickStyle.None;
            trackBarBlue.ValueChanged += TrackbarColorChanged;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(16, 360);
            label2.Name = "label2";
            label2.Size = new Size(38, 15);
            label2.TabIndex = 17;
            label2.Text = "Alpha";
            // 
            // numericAlpha
            // 
            numericAlpha.Location = new Point(60, 358);
            numericAlpha.Maximum = new decimal(new int[] { 255, 0, 0, 0 });
            numericAlpha.Name = "numericAlpha";
            numericAlpha.Size = new Size(52, 23);
            numericAlpha.TabIndex = 16;
            numericAlpha.ValueChanged += NumericColorChanged;
            // 
            // trackBarAlpha
            // 
            trackBarAlpha.AutoSize = false;
            trackBarAlpha.Location = new Point(118, 358);
            trackBarAlpha.Maximum = 255;
            trackBarAlpha.Name = "trackBarAlpha";
            trackBarAlpha.Size = new Size(122, 28);
            trackBarAlpha.TabIndex = 15;
            trackBarAlpha.TickStyle = TickStyle.None;
            trackBarAlpha.ValueChanged += TrackbarColorChanged;
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(16, 331);
            label3.Name = "label3";
            label3.Size = new Size(38, 15);
            label3.TabIndex = 14;
            label3.Text = "Green";
            // 
            // numericGreen
            // 
            numericGreen.Location = new Point(60, 329);
            numericGreen.Maximum = new decimal(new int[] { 255, 0, 0, 0 });
            numericGreen.Name = "numericGreen";
            numericGreen.Size = new Size(52, 23);
            numericGreen.TabIndex = 13;
            numericGreen.ValueChanged += NumericColorChanged;
            // 
            // trackBarGreen
            // 
            trackBarGreen.AutoSize = false;
            trackBarGreen.Location = new Point(118, 329);
            trackBarGreen.Maximum = 255;
            trackBarGreen.Name = "trackBarGreen";
            trackBarGreen.Size = new Size(122, 28);
            trackBarGreen.TabIndex = 12;
            trackBarGreen.TickStyle = TickStyle.None;
            trackBarGreen.ValueChanged += TrackbarColorChanged;
            // 
            // panelColorSampleAlpha
            // 
            panelColorSampleAlpha.BackColor = Color.Red;
            panelColorSampleAlpha.Location = new Point(260, 347);
            panelColorSampleAlpha.Name = "panelColorSampleAlpha";
            panelColorSampleAlpha.Size = new Size(54, 34);
            panelColorSampleAlpha.TabIndex = 18;
            // 
            // labelColorSolid
            // 
            labelColorSolid.AutoSize = true;
            labelColorSolid.Location = new Point(260, 313);
            labelColorSolid.Name = "labelColorSolid";
            labelColorSolid.Size = new Size(73, 15);
            labelColorSolid.TabIndex = 19;
            labelColorSolid.Text = "Color (Solid)";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(260, 384);
            label4.Name = "label4";
            label4.Size = new Size(106, 15);
            label4.TabIndex = 20;
            label4.Text = "Color (With Alpha)";
            // 
            // panelSwatches
            // 
            panelSwatches.BackColor = SystemColors.ScrollBar;
            panelSwatches.Location = new Point(12, 12);
            panelSwatches.Name = "panelSwatches";
            panelSwatches.Size = new Size(354, 237);
            panelSwatches.TabIndex = 22;
            // 
            // buttonColorPicker
            // 
            buttonColorPicker.Location = new Point(16, 387);
            buttonColorPicker.Name = "buttonColorPicker";
            buttonColorPicker.Size = new Size(75, 50);
            buttonColorPicker.TabIndex = 23;
            buttonColorPicker.Text = "Color picker";
            buttonColorPicker.UseVisualStyleBackColor = true;
            buttonColorPicker.Click += ButtonColorPicker_Click;
            // 
            // ColorDialogAlpha
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(379, 450);
            Controls.Add(buttonColorPicker);
            Controls.Add(panelSwatches);
            Controls.Add(label4);
            Controls.Add(labelColorSolid);
            Controls.Add(panelColorSampleAlpha);
            Controls.Add(label2);
            Controls.Add(numericAlpha);
            Controls.Add(trackBarAlpha);
            Controls.Add(label3);
            Controls.Add(numericGreen);
            Controls.Add(trackBarGreen);
            Controls.Add(label1);
            Controls.Add(numericBlue);
            Controls.Add(trackBarBlue);
            Controls.Add(labelRed);
            Controls.Add(numericRed);
            Controls.Add(panelColorSampleSolid);
            Controls.Add(trackBarRed);
            Controls.Add(buttonCancel);
            Controls.Add(buttonOK);
            FormBorderStyle = FormBorderStyle.SizableToolWindow;
            KeyPreview = true;
            Name = "ColorDialogAlpha";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Select color";
            KeyDown += ColorDialogAlpha_KeyDown;
            ((System.ComponentModel.ISupportInitialize)trackBarRed).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericRed).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericBlue).EndInit();
            ((System.ComponentModel.ISupportInitialize)trackBarBlue).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericAlpha).EndInit();
            ((System.ComponentModel.ISupportInitialize)trackBarAlpha).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericGreen).EndInit();
            ((System.ComponentModel.ISupportInitialize)trackBarGreen).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Button buttonOK;
        private Button buttonCancel;
        private TrackBar trackBarRed;
        private Panel panelColorSampleSolid;
        private NumericUpDown numericRed;
        private Label labelRed;
        private Label label1;
        private NumericUpDown numericBlue;
        private TrackBar trackBarBlue;
        private Label label2;
        private NumericUpDown numericAlpha;
        private TrackBar trackBarAlpha;
        private Label label3;
        private NumericUpDown numericGreen;
        private TrackBar trackBarGreen;
        private Panel panelColorSampleAlpha;
        private Label labelColorSolid;
        private Label label4;
        private Panel panelSwatches;
        private Button buttonColorPicker;
    }
}