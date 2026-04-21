namespace ScreenShotTool.Controls
{
    partial class symbolImage
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
            panelPropertiesImage = new Panel();
            buttonResetImageSize = new Button();
            labelRotation = new Label();
            numericRotation = new NumericUpDown();
            panelPropertiesImage.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericRotation).BeginInit();
            SuspendLayout();
            // 
            // panelPropertiesImage
            // 
            panelPropertiesImage.BorderStyle = BorderStyle.FixedSingle;
            panelPropertiesImage.Controls.Add(buttonResetImageSize);
            panelPropertiesImage.Controls.Add(labelRotation);
            panelPropertiesImage.Controls.Add(numericRotation);
            panelPropertiesImage.Dock = DockStyle.Fill;
            panelPropertiesImage.Location = new Point(0, 0);
            panelPropertiesImage.Name = "panelPropertiesImage";
            panelPropertiesImage.Size = new Size(170, 56);
            panelPropertiesImage.TabIndex = 107;
            // 
            // buttonResetImageSize
            // 
            buttonResetImageSize.Location = new Point(4, 3);
            buttonResetImageSize.Name = "buttonResetImageSize";
            buttonResetImageSize.Size = new Size(94, 23);
            buttonResetImageSize.TabIndex = 51;
            buttonResetImageSize.Text = "Reset size";
            buttonResetImageSize.UseVisualStyleBackColor = true;
            // 
            // labelRotation
            // 
            labelRotation.AutoSize = true;
            labelRotation.Location = new Point(4, 31);
            labelRotation.Name = "labelRotation";
            labelRotation.Size = new Size(52, 15);
            labelRotation.TabIndex = 1;
            labelRotation.Text = "Rotation";
            // 
            // numericRotation
            // 
            numericRotation.DecimalPlaces = 1;
            numericRotation.Location = new Point(110, 28);
            numericRotation.Maximum = new decimal(new int[] { 720, 0, 0, 0 });
            numericRotation.Minimum = new decimal(new int[] { 720, 0, 0, int.MinValue });
            numericRotation.Name = "numericRotation";
            numericRotation.Size = new Size(55, 23);
            numericRotation.TabIndex = 52;
            // 
            // symbolImage
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panelPropertiesImage);
            Name = "symbolImage";
            Size = new Size(170, 56);
            panelPropertiesImage.ResumeLayout(false);
            panelPropertiesImage.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)numericRotation).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Panel panelPropertiesImage;
        private Label labelRotation;
        internal Button buttonResetImageSize;
        internal NumericUpDown numericRotation;
    }
}
