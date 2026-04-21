namespace ScreenShotTool.Controls
{
    partial class SymbolOrganize
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
            buttonToBack = new Button();
            buttonToFront = new Button();
            buttonDeleteSymbol = new Button();
            panel1 = new Panel();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // buttonToBack
            // 
            buttonToBack.Location = new Point(69, 3);
            buttonToBack.Name = "buttonToBack";
            buttonToBack.Size = new Size(69, 23);
            buttonToBack.TabIndex = 74;
            buttonToBack.Text = "To Back";
            buttonToBack.UseVisualStyleBackColor = true;
            // 
            // buttonToFront
            // 
            buttonToFront.Location = new Point(3, 3);
            buttonToFront.Name = "buttonToFront";
            buttonToFront.Size = new Size(65, 23);
            buttonToFront.TabIndex = 73;
            buttonToFront.Text = "To Front";
            buttonToFront.UseVisualStyleBackColor = true;
            // 
            // buttonDeleteSymbol
            // 
            buttonDeleteSymbol.Location = new Point(3, 28);
            buttonDeleteSymbol.Name = "buttonDeleteSymbol";
            buttonDeleteSymbol.Size = new Size(94, 23);
            buttonDeleteSymbol.TabIndex = 75;
            buttonDeleteSymbol.Text = "Delete Symbol";
            buttonDeleteSymbol.UseVisualStyleBackColor = true;
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(buttonToFront);
            panel1.Controls.Add(buttonToBack);
            panel1.Controls.Add(buttonDeleteSymbol);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(170, 54);
            panel1.TabIndex = 76;
            // 
            // SymbolOrganize
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            Controls.Add(panel1);
            Name = "SymbolOrganize";
            Size = new Size(170, 54);
            panel1.ResumeLayout(false);
            ResumeLayout(false);
        }

        #endregion

        internal Button buttonToBack;
        internal Button buttonToFront;
        internal Button buttonDeleteSymbol;
        private Panel panel1;
    }
}
