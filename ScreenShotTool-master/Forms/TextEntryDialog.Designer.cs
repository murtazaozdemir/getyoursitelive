namespace ScreenShotTool.Forms
{
    partial class TextEntryDialog
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
            textBox1 = new TextBox();
            buttonCancel = new Button();
            buttonOK = new Button();
            panel1 = new Panel();
            panel1.SuspendLayout();
            SuspendLayout();
            // 
            // textBox1
            // 
            textBox1.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            textBox1.Location = new Point(12, 12);
            textBox1.Multiline = true;
            textBox1.Name = "textBox1";
            textBox1.ScrollBars = ScrollBars.Both;
            textBox1.Size = new Size(572, 248);
            textBox1.TabIndex = 0;
            textBox1.WordWrap = false;
            textBox1.TextChanged += TextBox1_TextChanged;
            // 
            // button1
            // 
            buttonCancel.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            buttonCancel.DialogResult = DialogResult.Cancel;
            buttonCancel.Location = new Point(433, 5);
            buttonCancel.Name = "button1";
            buttonCancel.Size = new Size(75, 23);
            buttonCancel.TabIndex = 1;
            buttonCancel.Text = "Cancel";
            buttonCancel.UseVisualStyleBackColor = true;
            // 
            // button2
            // 
            buttonOK.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            buttonOK.Location = new Point(512, 5);
            buttonOK.Name = "button2";
            buttonOK.Size = new Size(75, 23);
            buttonOK.TabIndex = 2;
            buttonOK.Text = "OK";
            buttonOK.UseVisualStyleBackColor = true;
            buttonOK.Click += ButtonOK_Click;
            // 
            // panel1
            // 
            panel1.Controls.Add(buttonCancel);
            panel1.Controls.Add(buttonOK);
            panel1.Dock = DockStyle.Bottom;
            panel1.Location = new Point(0, 266);
            panel1.Name = "panel1";
            panel1.Size = new Size(591, 33);
            panel1.TabIndex = 3;
            // 
            // TextEntryDialog
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(591, 299);
            Controls.Add(panel1);
            Controls.Add(textBox1);
            FormBorderStyle = FormBorderStyle.SizableToolWindow;
            KeyPreview = true;
            Name = "TextEntryDialog";
            StartPosition = FormStartPosition.CenterParent;
            Text = "TextEntryDialog";
            KeyDown += TextEntryDialog_KeyDown;
            panel1.ResumeLayout(false);
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox textBox1;
        private Button buttonCancel;
        private Button buttonOK;
        private Panel panel1;
    }
}