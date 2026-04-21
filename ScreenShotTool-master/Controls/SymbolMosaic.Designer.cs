namespace ScreenShotTool.Controls
{
    partial class SymbolMosaic
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
            panelPropertiesBlur = new Panel();
            label17 = new Label();
            numericBlurMosaicSize = new NumericUpDown();
            panelPropertiesBlur.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericBlurMosaicSize).BeginInit();
            SuspendLayout();
            // 
            // panelPropertiesBlur
            // 
            panelPropertiesBlur.BorderStyle = BorderStyle.FixedSingle;
            panelPropertiesBlur.Controls.Add(label17);
            panelPropertiesBlur.Controls.Add(numericBlurMosaicSize);
            panelPropertiesBlur.Dock = DockStyle.Fill;
            panelPropertiesBlur.Location = new Point(0, 0);
            panelPropertiesBlur.Name = "panelPropertiesBlur";
            panelPropertiesBlur.Size = new Size(170, 30);
            panelPropertiesBlur.TabIndex = 104;
            // 
            // label17
            // 
            label17.AutoSize = true;
            label17.Location = new Point(4, 5);
            label17.Name = "label17";
            label17.Size = new Size(68, 15);
            label17.TabIndex = 26;
            label17.Text = "Mosaic Size";
            // 
            // numericBlurMosaicSize
            // 
            numericBlurMosaicSize.AccessibleName = "Mosaic pixel size (applies to all blur symbols)";
            numericBlurMosaicSize.Location = new Point(110, 2);
            numericBlurMosaicSize.Maximum = new decimal(new int[] { 50, 0, 0, 0 });
            numericBlurMosaicSize.Minimum = new decimal(new int[] { 3, 0, 0, 0 });
            numericBlurMosaicSize.Name = "numericBlurMosaicSize";
            numericBlurMosaicSize.Size = new Size(55, 23);
            numericBlurMosaicSize.TabIndex = 47;
            numericBlurMosaicSize.Value = new decimal(new int[] { 10, 0, 0, 0 });
            // 
            // SymbolMosaic
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panelPropertiesBlur);
            Name = "SymbolMosaic";
            Size = new Size(170, 30);
            panelPropertiesBlur.ResumeLayout(false);
            panelPropertiesBlur.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericBlurMosaicSize).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panelPropertiesBlur;
        private Label label17;
        internal NumericUpDown numericBlurMosaicSize;
    }
}
