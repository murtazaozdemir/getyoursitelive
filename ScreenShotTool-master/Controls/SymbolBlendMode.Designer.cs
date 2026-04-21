namespace ScreenShotTool.Controls
{
    partial class SymbolBlendMode
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
            panelPropertiesHighlight = new Panel();
            numericBlue = new NumericUpDown();
            numericGreen = new NumericUpDown();
            label1 = new Label();
            labelChannel = new Label();
            numericRed = new NumericUpDown();
            label18 = new Label();
            comboBoxBlendMode = new ComboBox();
            numericAdjustmentValue = new NumericUpDown();
            labelAdjustment = new Label();
            panelPropertiesHighlight.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericBlue).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericGreen).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericRed).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericAdjustmentValue).BeginInit();
            SuspendLayout();
            // 
            // panelPropertiesHighlight
            // 
            panelPropertiesHighlight.BorderStyle = BorderStyle.FixedSingle;
            panelPropertiesHighlight.Controls.Add(labelAdjustment);
            panelPropertiesHighlight.Controls.Add(numericAdjustmentValue);
            panelPropertiesHighlight.Controls.Add(numericBlue);
            panelPropertiesHighlight.Controls.Add(numericGreen);
            panelPropertiesHighlight.Controls.Add(label1);
            panelPropertiesHighlight.Controls.Add(labelChannel);
            panelPropertiesHighlight.Controls.Add(numericRed);
            panelPropertiesHighlight.Controls.Add(label18);
            panelPropertiesHighlight.Controls.Add(comboBoxBlendMode);
            panelPropertiesHighlight.Dock = DockStyle.Fill;
            panelPropertiesHighlight.Location = new Point(0, 0);
            panelPropertiesHighlight.Name = "panelPropertiesHighlight";
            panelPropertiesHighlight.Size = new Size(170, 130);
            panelPropertiesHighlight.TabIndex = 105;
            // 
            // numericBlue
            // 
            numericBlue.DecimalPlaces = 2;
            numericBlue.Increment = new decimal(new int[] { 1, 0, 0, 131072 });
            numericBlue.Location = new Point(124, 72);
            numericBlue.Maximum = new decimal(new int[] { 1, 0, 0, 0 });
            numericBlue.Name = "numericBlue";
            numericBlue.Size = new Size(42, 23);
            numericBlue.TabIndex = 56;
            numericBlue.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // numericGreen
            // 
            numericGreen.DecimalPlaces = 2;
            numericGreen.Increment = new decimal(new int[] { 1, 0, 0, 131072 });
            numericGreen.Location = new Point(78, 72);
            numericGreen.Maximum = new decimal(new int[] { 1, 0, 0, 0 });
            numericGreen.Name = "numericGreen";
            numericGreen.Size = new Size(42, 23);
            numericGreen.TabIndex = 55;
            numericGreen.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(3, 74);
            label1.Name = "label1";
            label1.Size = new Size(29, 15);
            label1.TabIndex = 54;
            label1.Text = "RGB";
            // 
            // labelChannel
            // 
            labelChannel.AutoSize = true;
            labelChannel.Location = new Point(3, 51);
            labelChannel.Name = "labelChannel";
            labelChannel.Size = new Size(159, 15);
            labelChannel.TabIndex = 50;
            labelChannel.Text = "Affect color channel amount";
            // 
            // numericRed
            // 
            numericRed.DecimalPlaces = 2;
            numericRed.Increment = new decimal(new int[] { 1, 0, 0, 131072 });
            numericRed.Location = new Point(33, 72);
            numericRed.Maximum = new decimal(new int[] { 1, 0, 0, 0 });
            numericRed.Name = "numericRed";
            numericRed.Size = new Size(42, 23);
            numericRed.TabIndex = 49;
            numericRed.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // label18
            // 
            label18.AutoSize = true;
            label18.Location = new Point(3, 4);
            label18.Name = "label18";
            label18.Size = new Size(117, 15);
            label18.TabIndex = 30;
            label18.Text = "Higlight blend mode";
            // 
            // comboBoxBlendMode
            // 
            comboBoxBlendMode.FormattingEnabled = true;
            comboBoxBlendMode.Items.AddRange(new object[] { "Multiply", "Lighten", "Darken", "Desaturate", "Normal", "Divide", "Invert", "Contrast", "InvertBrightness", "Tint", "TintBrightColors", "Dither" });
            comboBoxBlendMode.Location = new Point(3, 22);
            comboBoxBlendMode.Name = "comboBoxBlendMode";
            comboBoxBlendMode.Size = new Size(162, 23);
            comboBoxBlendMode.TabIndex = 48;
            comboBoxBlendMode.Text = "Multiply";
            // 
            // numericAdjustmentValue
            // 
            numericAdjustmentValue.Location = new Point(99, 102);
            numericAdjustmentValue.Maximum = new decimal(new int[] { 255, 0, 0, 0 });
            numericAdjustmentValue.Name = "numericAdjustmentValue";
            numericAdjustmentValue.Size = new Size(63, 23);
            numericAdjustmentValue.TabIndex = 57;
            // 
            // labelAdjustment
            // 
            labelAdjustment.AutoSize = true;
            labelAdjustment.Location = new Point(3, 104);
            labelAdjustment.Name = "labelAdjustment";
            labelAdjustment.Size = new Size(69, 15);
            labelAdjustment.TabIndex = 58;
            labelAdjustment.Text = "Adjustment";
            // 
            // SymbolBlendMode
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panelPropertiesHighlight);
            Name = "SymbolBlendMode";
            Size = new Size(170, 130);
            panelPropertiesHighlight.ResumeLayout(false);
            panelPropertiesHighlight.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericBlue).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericGreen).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericRed).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericAdjustmentValue).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panelPropertiesHighlight;
        private Label label18;
        internal ComboBox comboBoxBlendMode;
        private Label labelChannel;
        private Label label1;
        internal NumericUpDown numericRed;
        internal NumericUpDown numericBlue;
        internal NumericUpDown numericGreen;
        internal Label labelAdjustment;
        internal NumericUpDown numericAdjustmentValue;
    }
}
