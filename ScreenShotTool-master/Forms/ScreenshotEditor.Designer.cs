namespace ScreenShotTool.Forms
{
    partial class ScreenshotEditor
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(ScreenshotEditor));
            menuStrip1 = new MenuStrip();
            fileToolStripMenuItem = new ToolStripMenuItem();
            itemNewImage = new ToolStripMenuItem();
            itemSave = new ToolStripMenuItem();
            itemLoadFromFile = new ToolStripMenuItem();
            toolStripMenuItem1 = new ToolStripMenuItem();
            itemLoadFromClipboard = new ToolStripMenuItem();
            itemExit = new ToolStripMenuItem();
            editToolStripMenuItem = new ToolStripMenuItem();
            copyToolStripMenuItem = new ToolStripMenuItem();
            pasteIntoThisImageToolStripMenuItem = new ToolStripMenuItem();
            itemPasteScaled = new ToolStripMenuItem();
            deleteOverlayElementsToolStripMenuItem = new ToolStripMenuItem();
            helpToolStripMenuItem = new ToolStripMenuItem();
            helpToolStripMenuItem1 = new ToolStripMenuItem();
            documentationonGithubToolStripMenuItem = new ToolStripMenuItem();
            websiteToolStripMenuItem = new ToolStripMenuItem();
            aboutToolStripMenuItem = new ToolStripMenuItem();
            panelButtons = new Panel();
            buttonStickers = new Button();
            buttonFilledCurve = new Button();
            buttonDraw = new Button();
            buttonNumbered = new Button();
            buttonCrop = new Button();
            buttonHighlight = new Button();
            buttonBlur = new Button();
            buttonSelect = new Button();
            buttonBorder = new Button();
            buttonText = new Button();
            buttonArrow = new Button();
            buttonLine = new Button();
            buttonCircle = new Button();
            buttonRectangle = new Button();
            numericNewLineWeight = new NumericUpDown();
            panelImage = new PanelNoScrollOnFocus();
            pictureBoxOverlay = new PictureBox();
            listViewSymbols = new ListView();
            columnHeaderType = new ColumnHeader();
            columnHeaderColor = new ColumnHeader();
            buttonNewColorFill = new Button();
            buttonNewColorLine = new Button();
            label1 = new Label();
            label9 = new Label();
            label10 = new Label();
            panel1 = new Panel();
            splitter2 = new Splitter();
            splitter1 = new Splitter();
            panel3 = new Panel();
            label19 = new Label();
            checkBoxNewShadow = new CheckBox();
            SymbolPropertiesPanel = new Panel();
            timerAfterLoad = new System.Windows.Forms.Timer(components);
            TimerUpdateOverlay = new System.Windows.Forms.Timer(components);
            toolTip1 = new ToolTip(components);
            timerFixDPI = new System.Windows.Forms.Timer(components);
            menuStrip1.SuspendLayout();
            panelButtons.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)numericNewLineWeight).BeginInit();
            panelImage.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)pictureBoxOverlay).BeginInit();
            panel1.SuspendLayout();
            panel3.SuspendLayout();
            SymbolPropertiesPanel.SuspendLayout();
            SuspendLayout();
            // 
            // menuStrip1
            // 
            menuStrip1.Items.AddRange(new ToolStripItem[] { fileToolStripMenuItem, editToolStripMenuItem, helpToolStripMenuItem });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Size = new Size(994, 24);
            menuStrip1.TabIndex = 0;
            menuStrip1.Text = "menuStrip1";
            // 
            // fileToolStripMenuItem
            // 
            fileToolStripMenuItem.DropDownItems.AddRange(new ToolStripItem[] { itemNewImage, itemSave, itemLoadFromFile, toolStripMenuItem1, itemLoadFromClipboard, itemExit });
            fileToolStripMenuItem.Name = "fileToolStripMenuItem";
            fileToolStripMenuItem.Size = new Size(37, 20);
            fileToolStripMenuItem.Text = "&File";
            // 
            // itemNewImage
            // 
            itemNewImage.Name = "itemNewImage";
            itemNewImage.Size = new Size(184, 22);
            itemNewImage.Text = "&New...";
            itemNewImage.Click += ItemNewImage_Click;
            // 
            // itemSave
            // 
            itemSave.Name = "itemSave";
            itemSave.Size = new Size(184, 22);
            itemSave.Text = "&Save...";
            itemSave.Click += SaveToolStripMenuItem_Click;
            // 
            // itemLoadFromFile
            // 
            itemLoadFromFile.Name = "itemLoadFromFile";
            itemLoadFromFile.Size = new Size(184, 22);
            itemLoadFromFile.Text = "&Open...";
            itemLoadFromFile.Click += LoadToolStripMenuItem_Click;
            // 
            // toolStripMenuItem1
            // 
            toolStripMenuItem1.Name = "toolStripMenuItem1";
            toolStripMenuItem1.Size = new Size(184, 22);
            toolStripMenuItem1.Text = "Print...";
            toolStripMenuItem1.Click += ToolStripMenuItemPrint_Click;
            // 
            // itemLoadFromClipboard
            // 
            itemLoadFromClipboard.Name = "itemLoadFromClipboard";
            itemLoadFromClipboard.Size = new Size(184, 22);
            itemLoadFromClipboard.Text = "Load from &Clipboard";
            itemLoadFromClipboard.Click += ItemLoadFromClipboard_Click;
            // 
            // itemExit
            // 
            itemExit.Name = "itemExit";
            itemExit.Size = new Size(184, 22);
            itemExit.Text = "E&xit";
            itemExit.Click += ItemExit_Click;
            // 
            // editToolStripMenuItem
            // 
            editToolStripMenuItem.DropDownItems.AddRange(new ToolStripItem[] { copyToolStripMenuItem, pasteIntoThisImageToolStripMenuItem, itemPasteScaled, deleteOverlayElementsToolStripMenuItem });
            editToolStripMenuItem.Name = "editToolStripMenuItem";
            editToolStripMenuItem.Size = new Size(39, 20);
            editToolStripMenuItem.Text = "&Edit";
            // 
            // copyToolStripMenuItem
            // 
            copyToolStripMenuItem.Name = "copyToolStripMenuItem";
            copyToolStripMenuItem.Size = new Size(190, 22);
            copyToolStripMenuItem.Text = "&Copy";
            copyToolStripMenuItem.Click += CopyToolStripMenuItem_Click;
            // 
            // pasteIntoThisImageToolStripMenuItem
            // 
            pasteIntoThisImageToolStripMenuItem.Name = "pasteIntoThisImageToolStripMenuItem";
            pasteIntoThisImageToolStripMenuItem.Size = new Size(190, 22);
            pasteIntoThisImageToolStripMenuItem.Text = "&Paste (Real size)";
            pasteIntoThisImageToolStripMenuItem.Click += PasteIntoThisImage_Click;
            // 
            // itemPasteScaled
            // 
            itemPasteScaled.Name = "itemPasteScaled";
            itemPasteScaled.Size = new Size(190, 22);
            itemPasteScaled.Text = "Paste from file";
            itemPasteScaled.Click += ItemPasteFromFile;
            // 
            // deleteOverlayElementsToolStripMenuItem
            // 
            deleteOverlayElementsToolStripMenuItem.Name = "deleteOverlayElementsToolStripMenuItem";
            deleteOverlayElementsToolStripMenuItem.Size = new Size(190, 22);
            deleteOverlayElementsToolStripMenuItem.Text = "&Delete added symbols";
            deleteOverlayElementsToolStripMenuItem.Click += DeleteOverlayElementsToolStripMenuItem_Click;
            // 
            // helpToolStripMenuItem
            // 
            helpToolStripMenuItem.DropDownItems.AddRange(new ToolStripItem[] { helpToolStripMenuItem1, documentationonGithubToolStripMenuItem, websiteToolStripMenuItem, aboutToolStripMenuItem });
            helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            helpToolStripMenuItem.Size = new Size(44, 20);
            helpToolStripMenuItem.Text = "&Help";
            // 
            // helpToolStripMenuItem1
            // 
            helpToolStripMenuItem1.Name = "helpToolStripMenuItem1";
            helpToolStripMenuItem1.Size = new Size(221, 22);
            helpToolStripMenuItem1.Text = "&Help";
            helpToolStripMenuItem1.Click += Help_Click;
            // 
            // documentationonGithubToolStripMenuItem
            // 
            documentationonGithubToolStripMenuItem.Name = "documentationonGithubToolStripMenuItem";
            documentationonGithubToolStripMenuItem.Size = new Size(221, 22);
            documentationonGithubToolStripMenuItem.Text = "&Documentation (on Github)";
            documentationonGithubToolStripMenuItem.Click += Documentation_Click;
            // 
            // websiteToolStripMenuItem
            // 
            websiteToolStripMenuItem.Name = "websiteToolStripMenuItem";
            websiteToolStripMenuItem.Size = new Size(221, 22);
            websiteToolStripMenuItem.Text = "&Website";
            websiteToolStripMenuItem.Click += Website_Click;
            // 
            // aboutToolStripMenuItem
            // 
            aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            aboutToolStripMenuItem.Size = new Size(221, 22);
            aboutToolStripMenuItem.Text = "&About";
            aboutToolStripMenuItem.Click += About_Click;
            // 
            // panelButtons
            // 
            panelButtons.BorderStyle = BorderStyle.FixedSingle;
            panelButtons.Controls.Add(buttonStickers);
            panelButtons.Controls.Add(buttonFilledCurve);
            panelButtons.Controls.Add(buttonDraw);
            panelButtons.Controls.Add(buttonNumbered);
            panelButtons.Controls.Add(buttonCrop);
            panelButtons.Controls.Add(buttonHighlight);
            panelButtons.Controls.Add(buttonBlur);
            panelButtons.Controls.Add(buttonSelect);
            panelButtons.Controls.Add(buttonBorder);
            panelButtons.Controls.Add(buttonText);
            panelButtons.Controls.Add(buttonArrow);
            panelButtons.Controls.Add(buttonLine);
            panelButtons.Controls.Add(buttonCircle);
            panelButtons.Controls.Add(buttonRectangle);
            panelButtons.Dock = DockStyle.Left;
            panelButtons.Location = new Point(0, 0);
            panelButtons.Name = "panelButtons";
            panelButtons.Size = new Size(46, 786);
            panelButtons.TabIndex = 1;
            // 
            // buttonStickers
            // 
            buttonStickers.AccessibleName = "Stickers";
            buttonStickers.FlatAppearance.BorderSize = 0;
            buttonStickers.FlatStyle = FlatStyle.Flat;
            buttonStickers.Image = Properties.Resources.star;
            buttonStickers.Location = new Point(4, 505);
            buttonStickers.Margin = new Padding(1);
            buttonStickers.Name = "buttonStickers";
            buttonStickers.Size = new Size(36, 36);
            buttonStickers.TabIndex = 14;
            toolTip1.SetToolTip(buttonStickers, "Stickers and cursors");
            buttonStickers.UseVisualStyleBackColor = true;
            buttonStickers.Click += ButtonStickers_Click;
            // 
            // buttonFilledCurve
            // 
            buttonFilledCurve.AccessibleName = "Filled curve";
            buttonFilledCurve.FlatAppearance.BorderSize = 0;
            buttonFilledCurve.FlatStyle = FlatStyle.Flat;
            buttonFilledCurve.Image = Properties.Resources.fillCurve;
            buttonFilledCurve.Location = new Point(4, 279);
            buttonFilledCurve.Margin = new Padding(1);
            buttonFilledCurve.Name = "buttonFilledCurve";
            buttonFilledCurve.Size = new Size(36, 36);
            buttonFilledCurve.TabIndex = 8;
            toolTip1.SetToolTip(buttonFilledCurve, "Filled curve");
            buttonFilledCurve.UseVisualStyleBackColor = true;
            buttonFilledCurve.Click += ButtonFillCurve_Click;
            // 
            // buttonDraw
            // 
            buttonDraw.AccessibleDescription = "Draw lines, cancel with right click or Escape";
            buttonDraw.AccessibleName = "Freehand curve";
            buttonDraw.FlatAppearance.BorderSize = 0;
            buttonDraw.FlatStyle = FlatStyle.Flat;
            buttonDraw.Image = Properties.Resources.pencil;
            buttonDraw.Location = new Point(4, 241);
            buttonDraw.Margin = new Padding(1);
            buttonDraw.Name = "buttonDraw";
            buttonDraw.Size = new Size(36, 36);
            buttonDraw.TabIndex = 7;
            toolTip1.SetToolTip(buttonDraw, "Freenhand lines. To stop, Right Click or press Cancel");
            buttonDraw.UseVisualStyleBackColor = true;
            buttonDraw.Click += ButtonDraw_Click;
            // 
            // buttonNumbered
            // 
            buttonNumbered.AccessibleName = "Number markers";
            buttonNumbered.FlatAppearance.BorderSize = 0;
            buttonNumbered.FlatStyle = FlatStyle.Flat;
            buttonNumbered.Image = Properties.Resources.numbered;
            buttonNumbered.Location = new Point(4, 393);
            buttonNumbered.Margin = new Padding(1);
            buttonNumbered.Name = "buttonNumbered";
            buttonNumbered.Size = new Size(36, 36);
            buttonNumbered.TabIndex = 11;
            toolTip1.SetToolTip(buttonNumbered, "Number markers (Automatically increments number)");
            buttonNumbered.UseVisualStyleBackColor = true;
            buttonNumbered.Click += ButtonNumbered_Click;
            // 
            // buttonCrop
            // 
            buttonCrop.AccessibleName = "Crop";
            buttonCrop.FlatAppearance.BorderSize = 0;
            buttonCrop.FlatStyle = FlatStyle.Flat;
            buttonCrop.Image = Properties.Resources.crop;
            buttonCrop.Location = new Point(4, 467);
            buttonCrop.Margin = new Padding(1);
            buttonCrop.Name = "buttonCrop";
            buttonCrop.Size = new Size(36, 36);
            buttonCrop.TabIndex = 13;
            toolTip1.SetToolTip(buttonCrop, "Crop or Copy region");
            buttonCrop.UseVisualStyleBackColor = true;
            buttonCrop.Click += ButtonCrop_Click;
            // 
            // buttonHighlight
            // 
            buttonHighlight.AccessibleName = "Highlighter";
            buttonHighlight.FlatAppearance.BorderSize = 0;
            buttonHighlight.FlatStyle = FlatStyle.Flat;
            buttonHighlight.Image = Properties.Resources.highlight1;
            buttonHighlight.Location = new Point(4, 355);
            buttonHighlight.Margin = new Padding(1);
            buttonHighlight.Name = "buttonHighlight";
            buttonHighlight.Size = new Size(36, 36);
            buttonHighlight.TabIndex = 10;
            toolTip1.SetToolTip(buttonHighlight, "Highlighter");
            buttonHighlight.UseVisualStyleBackColor = true;
            buttonHighlight.Click += ButtonHighlight_Click;
            // 
            // buttonBlur
            // 
            buttonBlur.AccessibleName = "Blur Mosaic";
            buttonBlur.FlatAppearance.BorderSize = 0;
            buttonBlur.FlatStyle = FlatStyle.Flat;
            buttonBlur.Image = Properties.Resources.blur1;
            buttonBlur.Location = new Point(4, 317);
            buttonBlur.Margin = new Padding(1);
            buttonBlur.Name = "buttonBlur";
            buttonBlur.Size = new Size(36, 36);
            buttonBlur.TabIndex = 9;
            toolTip1.SetToolTip(buttonBlur, "Mosaic blur (obscure a region)");
            buttonBlur.UseVisualStyleBackColor = true;
            buttonBlur.Click += ButtonBlur_Click;
            // 
            // buttonSelect
            // 
            buttonSelect.AccessibleName = "Select";
            buttonSelect.FlatAppearance.BorderSize = 0;
            buttonSelect.FlatStyle = FlatStyle.Flat;
            buttonSelect.Image = Properties.Resources.cursor_select;
            buttonSelect.Location = new Point(4, 5);
            buttonSelect.Margin = new Padding(1);
            buttonSelect.Name = "buttonSelect";
            buttonSelect.Size = new Size(36, 36);
            buttonSelect.TabIndex = 1;
            toolTip1.SetToolTip(buttonSelect, "Select (right click or Escape when drawing to switch to select)");
            buttonSelect.UseVisualStyleBackColor = true;
            buttonSelect.Click += ButtonSelect_Click;
            // 
            // buttonBorder
            // 
            buttonBorder.AccessibleName = "Border Frame";
            buttonBorder.FlatAppearance.BorderSize = 0;
            buttonBorder.FlatStyle = FlatStyle.Flat;
            buttonBorder.Image = Properties.Resources.frame;
            buttonBorder.Location = new Point(4, 431);
            buttonBorder.Margin = new Padding(1);
            buttonBorder.Name = "buttonBorder";
            buttonBorder.Size = new Size(36, 36);
            buttonBorder.TabIndex = 12;
            toolTip1.SetToolTip(buttonBorder, "Frame (adds a line around the image)");
            buttonBorder.UseVisualStyleBackColor = true;
            buttonBorder.Click += ButtonBorder_Click;
            // 
            // buttonText
            // 
            buttonText.AccessibleName = "Text";
            buttonText.FlatAppearance.BorderSize = 0;
            buttonText.FlatStyle = FlatStyle.Flat;
            buttonText.Image = Properties.Resources.toolText;
            buttonText.Location = new Point(4, 203);
            buttonText.Margin = new Padding(1);
            buttonText.Name = "buttonText";
            buttonText.Size = new Size(36, 36);
            buttonText.TabIndex = 6;
            toolTip1.SetToolTip(buttonText, "Text");
            buttonText.UseVisualStyleBackColor = true;
            buttonText.Click += ButtonNewText_Click;
            // 
            // buttonArrow
            // 
            buttonArrow.AccessibleName = "Arrow";
            buttonArrow.FlatAppearance.BorderSize = 0;
            buttonArrow.FlatStyle = FlatStyle.Flat;
            buttonArrow.Image = Properties.Resources.toolArrow;
            buttonArrow.Location = new Point(4, 163);
            buttonArrow.Margin = new Padding(1);
            buttonArrow.Name = "buttonArrow";
            buttonArrow.Size = new Size(36, 36);
            buttonArrow.TabIndex = 5;
            toolTip1.SetToolTip(buttonArrow, "Arrow");
            buttonArrow.UseVisualStyleBackColor = true;
            buttonArrow.Click += ButtonArrow_Click;
            // 
            // buttonLine
            // 
            buttonLine.AccessibleName = "Line";
            buttonLine.FlatAppearance.BorderSize = 0;
            buttonLine.FlatStyle = FlatStyle.Flat;
            buttonLine.Image = Properties.Resources.toolLine;
            buttonLine.Location = new Point(4, 123);
            buttonLine.Margin = new Padding(1);
            buttonLine.Name = "buttonLine";
            buttonLine.Size = new Size(36, 36);
            buttonLine.TabIndex = 4;
            toolTip1.SetToolTip(buttonLine, "Line");
            buttonLine.UseVisualStyleBackColor = true;
            buttonLine.Click += ButtonLine_Click;
            // 
            // buttonCircle
            // 
            buttonCircle.AccessibleName = "Ellipse";
            buttonCircle.FlatAppearance.BorderSize = 0;
            buttonCircle.FlatStyle = FlatStyle.Flat;
            buttonCircle.Image = Properties.Resources.toolEllipse;
            buttonCircle.Location = new Point(4, 83);
            buttonCircle.Margin = new Padding(1);
            buttonCircle.Name = "buttonCircle";
            buttonCircle.Size = new Size(36, 36);
            buttonCircle.TabIndex = 3;
            toolTip1.SetToolTip(buttonCircle, "Circle / Ellipse");
            buttonCircle.UseVisualStyleBackColor = true;
            buttonCircle.Click += ButtonCircle_Click;
            // 
            // buttonRectangle
            // 
            buttonRectangle.AccessibleName = "Rectangle";
            buttonRectangle.FlatAppearance.BorderSize = 0;
            buttonRectangle.FlatStyle = FlatStyle.Flat;
            buttonRectangle.Image = Properties.Resources.toolRectangle2;
            buttonRectangle.Location = new Point(4, 43);
            buttonRectangle.Margin = new Padding(1);
            buttonRectangle.Name = "buttonRectangle";
            buttonRectangle.Size = new Size(36, 36);
            buttonRectangle.TabIndex = 2;
            toolTip1.SetToolTip(buttonRectangle, "Rectangle");
            buttonRectangle.UseVisualStyleBackColor = true;
            buttonRectangle.Click += ButtonRectangle_Click;
            // 
            // numericNewLineWeight
            // 
            numericNewLineWeight.AccessibleName = "New symbol line weight";
            numericNewLineWeight.Location = new Point(462, 5);
            numericNewLineWeight.Maximum = new decimal(new int[] { 50, 0, 0, 0 });
            numericNewLineWeight.Name = "numericNewLineWeight";
            numericNewLineWeight.Size = new Size(48, 23);
            numericNewLineWeight.TabIndex = 22;
            toolTip1.SetToolTip(numericNewLineWeight, "Set line width for the next created symbol");
            numericNewLineWeight.Value = new decimal(new int[] { 2, 0, 0, 0 });
            numericNewLineWeight.ValueChanged += NumericNewLineWeight_ValueChanged;
            // 
            // panelImage
            // 
            panelImage.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            panelImage.AutoScroll = true;
            panelImage.BackColor = SystemColors.ControlDark;
            panelImage.Controls.Add(pictureBoxOverlay);
            panelImage.Location = new Point(49, 34);
            panelImage.Name = "panelImage";
            panelImage.Size = new Size(745, 749);
            panelImage.TabIndex = 3;
            // 
            // pictureBoxOverlay
            // 
            pictureBoxOverlay.BackColor = Color.Black;
            pictureBoxOverlay.Location = new Point(0, 0);
            pictureBoxOverlay.Name = "pictureBoxOverlay";
            pictureBoxOverlay.Size = new Size(500, 500);
            pictureBoxOverlay.TabIndex = 1;
            pictureBoxOverlay.TabStop = false;
            pictureBoxOverlay.DoubleClick += PictureBoxOverlay_DoubleClick;
            pictureBoxOverlay.MouseDown += PictureBoxOverlay_MouseDown;
            pictureBoxOverlay.MouseMove += PictureBoxOverlay_MouseMove;
            pictureBoxOverlay.MouseUp += PictureBoxOverlay_MouseUp;
            // 
            // listViewSymbols
            // 
            listViewSymbols.Columns.AddRange(new ColumnHeader[] { columnHeaderType, columnHeaderColor });
            listViewSymbols.Location = new Point(3, 2);
            listViewSymbols.Name = "listViewSymbols";
            listViewSymbols.Size = new Size(170, 83);
            listViewSymbols.TabIndex = 30;
            listViewSymbols.UseCompatibleStateImageBehavior = false;
            listViewSymbols.View = View.List;
            listViewSymbols.SelectedIndexChanged += ListViewSymbols_SelectedIndexChanged;
            // 
            // columnHeaderType
            // 
            columnHeaderType.Text = "Symbol";
            // 
            // columnHeaderColor
            // 
            columnHeaderColor.Text = "Color";
            // 
            // buttonNewColorFill
            // 
            buttonNewColorFill.AccessibleName = "New symbol fill color";
            buttonNewColorFill.BackColor = Color.LightCyan;
            buttonNewColorFill.FlatAppearance.BorderColor = Color.Black;
            buttonNewColorFill.FlatStyle = FlatStyle.Flat;
            buttonNewColorFill.Location = new Point(320, 3);
            buttonNewColorFill.Name = "buttonNewColorFill";
            buttonNewColorFill.Size = new Size(60, 23);
            buttonNewColorFill.TabIndex = 21;
            buttonNewColorFill.Tag = "FillColor";
            toolTip1.SetToolTip(buttonNewColorFill, "Set fill color for the next created symbol");
            buttonNewColorFill.UseVisualStyleBackColor = false;
            buttonNewColorFill.Click += NewSymbolColor_Click;
            // 
            // buttonNewColorLine
            // 
            buttonNewColorLine.AccessibleName = "New symbol line color";
            buttonNewColorLine.BackColor = Color.Orange;
            buttonNewColorLine.FlatAppearance.BorderColor = Color.Black;
            buttonNewColorLine.FlatStyle = FlatStyle.Flat;
            buttonNewColorLine.Location = new Point(194, 3);
            buttonNewColorLine.Name = "buttonNewColorLine";
            buttonNewColorLine.Size = new Size(60, 23);
            buttonNewColorLine.TabIndex = 20;
            buttonNewColorLine.Tag = "LineColor";
            toolTip1.SetToolTip(buttonNewColorLine, "Set line color or text color for the next created symbol");
            buttonNewColorLine.UseVisualStyleBackColor = false;
            buttonNewColorLine.Click += NewSymbolColor_Click;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(260, 7);
            label1.Name = "label1";
            label1.Size = new Size(54, 15);
            label1.TabIndex = 16;
            label1.Text = "Fill Color";
            // 
            // label9
            // 
            label9.AutoSize = true;
            label9.Location = new Point(129, 7);
            label9.Name = "label9";
            label9.Size = new Size(61, 15);
            label9.TabIndex = 15;
            label9.Text = "Line Color";
            // 
            // label10
            // 
            label10.AutoSize = true;
            label10.Location = new Point(388, 7);
            label10.Name = "label10";
            label10.Size = new Size(64, 15);
            label10.TabIndex = 19;
            label10.Text = "Line Width";
            // 
            // panel1
            // 
            panel1.BorderStyle = BorderStyle.FixedSingle;
            panel1.Controls.Add(splitter2);
            panel1.Controls.Add(splitter1);
            panel1.Controls.Add(panel3);
            panel1.Controls.Add(SymbolPropertiesPanel);
            panel1.Controls.Add(panelButtons);
            panel1.Controls.Add(panelImage);
            panel1.Dock = DockStyle.Fill;
            panel1.Location = new Point(0, 24);
            panel1.Name = "panel1";
            panel1.Size = new Size(994, 788);
            panel1.TabIndex = 29;
            // 
            // splitter2
            // 
            splitter2.Dock = DockStyle.Right;
            splitter2.Location = new Point(796, 32);
            splitter2.Name = "splitter2";
            splitter2.Size = new Size(3, 754);
            splitter2.TabIndex = 41;
            splitter2.TabStop = false;
            // 
            // splitter1
            // 
            splitter1.Location = new Point(46, 32);
            splitter1.Name = "splitter1";
            splitter1.Size = new Size(3, 754);
            splitter1.TabIndex = 40;
            splitter1.TabStop = false;
            // 
            // panel3
            // 
            panel3.Controls.Add(label19);
            panel3.Controls.Add(numericNewLineWeight);
            panel3.Controls.Add(label10);
            panel3.Controls.Add(checkBoxNewShadow);
            panel3.Controls.Add(buttonNewColorFill);
            panel3.Controls.Add(buttonNewColorLine);
            panel3.Controls.Add(label9);
            panel3.Controls.Add(label1);
            panel3.Dock = DockStyle.Top;
            panel3.Location = new Point(46, 0);
            panel3.Name = "panel3";
            panel3.Size = new Size(753, 32);
            panel3.TabIndex = 39;
            // 
            // label19
            // 
            label19.AutoSize = true;
            label19.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            label19.Location = new Point(3, 7);
            label19.Name = "label19";
            label19.Size = new Size(125, 15);
            label19.TabIndex = 25;
            label19.Text = "New symbol settings:";
            // 
            // checkBoxNewShadow
            // 
            checkBoxNewShadow.AccessibleName = "New symbol Shadow toggle";
            checkBoxNewShadow.AutoSize = true;
            checkBoxNewShadow.CheckAlign = ContentAlignment.MiddleRight;
            checkBoxNewShadow.Location = new Point(516, 7);
            checkBoxNewShadow.Name = "checkBoxNewShadow";
            checkBoxNewShadow.Size = new Size(68, 19);
            checkBoxNewShadow.TabIndex = 23;
            checkBoxNewShadow.Text = "Shadow";
            toolTip1.SetToolTip(checkBoxNewShadow, "Enable shadows for the next created symbol");
            checkBoxNewShadow.UseVisualStyleBackColor = true;
            // 
            // SymbolPropertiesPanel
            // 
            SymbolPropertiesPanel.AutoScroll = true;
            SymbolPropertiesPanel.Controls.Add(listViewSymbols);
            SymbolPropertiesPanel.Dock = DockStyle.Right;
            SymbolPropertiesPanel.Location = new Point(799, 0);
            SymbolPropertiesPanel.Name = "SymbolPropertiesPanel";
            SymbolPropertiesPanel.Size = new Size(193, 786);
            SymbolPropertiesPanel.TabIndex = 38;
            // 
            // timerAfterLoad
            // 
            timerAfterLoad.Interval = 50;
            timerAfterLoad.Tick += TimerAfterLoad_Tick;
            // 
            // TimerUpdateOverlay
            // 
            TimerUpdateOverlay.Interval = 2;
            TimerUpdateOverlay.Tick += TimerUpdateOverlay_Tick;
            // 
            // toolTip1
            // 
            toolTip1.AutomaticDelay = 200;
            toolTip1.AutoPopDelay = 3000;
            toolTip1.InitialDelay = 200;
            toolTip1.ReshowDelay = 40;
            // 
            // timerFixDPI
            // 
            timerFixDPI.Tick += TimerFixDPI_Tick;
            // 
            // ScreenshotEditor
            // 
            AllowDrop = true;
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(994, 812);
            Controls.Add(panel1);
            Controls.Add(menuStrip1);
            Icon = (Icon)resources.GetObject("$this.Icon");
            KeyPreview = true;
            MainMenuStrip = menuStrip1;
            MinimumSize = new Size(700, 550);
            Name = "ScreenshotEditor";
            Text = "Screenshot Tool Editor";
            TopMost = true;
            Deactivate += ScreenshotEditor_Deactivate;
            DpiChanged += ScreenshotEditor_DpiChanged;
            DragDrop += ScreenshotEditor_DragDrop;
            DragEnter += ScreenshotEditor_DragEnter;
            KeyDown += ScreenshotEditor_KeyDown;
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            panelButtons.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)numericNewLineWeight).EndInit();
            panelImage.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)pictureBoxOverlay).EndInit();
            panel1.ResumeLayout(false);
            panel3.ResumeLayout(false);
            panel3.PerformLayout();
            SymbolPropertiesPanel.ResumeLayout(false);
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private MenuStrip menuStrip1;
        private Panel panelButtons;
        private ToolStripMenuItem fileToolStripMenuItem;
        private ToolStripMenuItem editToolStripMenuItem;
        //private Panel panelImage;
        private PanelNoScrollOnFocus panelImage;
        private ToolStripMenuItem itemSave;
        private ToolStripMenuItem itemLoadFromFile;
        private ToolStripMenuItem itemExit;
        private ToolStripMenuItem copyToolStripMenuItem;
        private Button buttonRectangle;
        private PictureBox pictureBoxOverlay;
        private ToolStripMenuItem deleteOverlayElementsToolStripMenuItem;
        private Button buttonCircle;
        private Button buttonLine;
        private ToolStripMenuItem itemLoadFromClipboard;
        private ToolStripMenuItem pasteIntoThisImageToolStripMenuItem;
        private ToolStripMenuItem itemPasteScaled;
        private ListView listViewSymbols;
        private ColumnHeader columnHeaderType;
        private ColumnHeader columnHeaderColor;
        private NumericUpDown numericNewLineWeight;
        private Button buttonArrow;
        private Button buttonNewColorFill;
        private Button buttonNewColorLine;
        private Label label1;
        private Label label9;
        private Label label10;
        private ToolStripMenuItem itemNewImage;
        private Button buttonText;
        private Panel panel1;
        private Button buttonBorder;
        private CheckBox checkBoxNewShadow;
        private Button buttonBlur;
        private System.Windows.Forms.Timer timerAfterLoad;
        private Button buttonSelect;
        private Button buttonHighlight;
        private System.Windows.Forms.Timer TimerUpdateOverlay;
        private Button buttonCrop;
        private Label label19;
        private Button buttonNumbered;
        private Button buttonDraw;
        private Button buttonFilledCurve;
        private ToolTip toolTip1;
        private Button buttonStickers;
        private Panel SymbolPropertiesPanel;
        private Panel panel3;
        private Splitter splitter1;
        private Splitter splitter2;
        private ToolStripMenuItem toolStripMenuItem1;
        private System.Windows.Forms.Timer timerFixDPI;
        private ToolStripMenuItem helpToolStripMenuItem;
        private ToolStripMenuItem helpToolStripMenuItem1;
        private ToolStripMenuItem documentationonGithubToolStripMenuItem;
        private ToolStripMenuItem websiteToolStripMenuItem;
        private ToolStripMenuItem aboutToolStripMenuItem;
    }
}