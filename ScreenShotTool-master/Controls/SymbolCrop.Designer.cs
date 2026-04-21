namespace ScreenShotTool.Controls
{
    partial class SymbolCrop
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
            panel1 = new Panel();
            buttonCopy = new Button();
            buttonCrop = new Button();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(buttonCopy);
            panel1.Controls.Add(buttonCrop);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 53);
            panel1.TabIndex = 0;
            // 
            // buttonCopy
            // 
            buttonCopy.Location = new Point(3, 2);
            buttonCopy.Name = "buttonCopy";
            buttonCopy.Size = new Size(95, 23);
            buttonCopy.TabIndex = 55;
            buttonCopy.Text = "Copy selection";
            buttonCopy.UseVisualStyleBackColor = true;
            // 
            // buttonCrop
            // 
            buttonCrop.Location = new Point(4, 27);
            buttonCrop.Name = "buttonCrop";
            buttonCrop.Size = new Size(94, 23);
            buttonCrop.TabIndex = 56;
            buttonCrop.Text = "Crop image";
            buttonCrop.UseVisualStyleBackColor = true;
            // 
            // SymbolCrop
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolCrop";
            Size = new Size(170, 53);
            panel1.ResumeLayout(false);
            ResumeLayout(false);
        }

        #endregion

        private Panel panel1;
        internal Button buttonCopy;
        internal Button buttonCrop;
    }
}
