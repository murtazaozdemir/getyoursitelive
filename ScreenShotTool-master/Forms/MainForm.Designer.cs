namespace ScreenShotTool
{
    partial class MainForm
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
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
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            textBoxLog = new TextBox();
            folderBrowserDialog1 = new FolderBrowserDialog();
            listViewThumbnails = new ListView();
            contextMenuListView = new ContextMenuStrip(components);
            itemOpenImage = new ToolStripMenuItem();
            itemOpenFileInExplorer = new ToolStripMenuItem();
            itemOpenFolder = new ToolStripMenuItem();
            itemDeleteFile = new ToolStripMenuItem();
            itemRename = new ToolStripMenuItem();
            itemRemove = new ToolStripMenuItem();
            copyToClipboardToolStripMenuItem = new ToolStripMenuItem();
            copyFileToolStripMenuItem = new ToolStripMenuItem();
            editImageToolStripMenuItem = new ToolStripMenuItem();
            convertFileFormatToolStripMenuItem = new ToolStripMenuItem();
            notifyIcon1 = new NotifyIcon(components);
            contextMenuSysTray = new ContextMenuStrip(components);
            helpToolStripMenuItem = new ToolStripMenuItem();
            openProgramToolStripMenuItem = new ToolStripMenuItem();
            optionsToolStripMenuItem = new ToolStripMenuItem();
            editorToolStripMenuItem = new ToolStripMenuItem();
            editTagsToolStripMenuItem1 = new ToolStripMenuItem();
            enableCroppingToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem4 = new ToolStripSeparator();
            toolStripMenuItem3 = new ToolStripMenuItem();
            copyClipboardImageToFileDropToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem8 = new ToolStripMenuItem();
            toolStripMenuItem5 = new ToolStripSeparator();
            openLastUsedFolderToolStripMenuItem = new ToolStripMenuItem();
            pToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem6 = new ToolStripSeparator();
            exitApplicationToolStripMenuItem = new ToolStripMenuItem();
            timerHide = new System.Windows.Forms.Timer(components);
            labelShowLog = new Label();
            menuStrip1 = new MenuStrip();
            TopMenuProgram = new ToolStripMenuItem();
            clearListToolStripMenuItem = new ToolStripMenuItem();
            openLastUsedFolderToolStripMenuItem1 = new ToolStripMenuItem();
            hideApplicationToolStripMenuItem = new ToolStripMenuItem();
            resetCounterToolStripMenuItem = new ToolStripMenuItem();
            toggleCropToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem2 = new ToolStripSeparator();
            exitToolStripMenuItem = new ToolStripMenuItem();
            TopMenuOptions = new ToolStripMenuItem();
            topMenuEdit = new ToolStripMenuItem();
            editSelectedFileToolStripMenuItem = new ToolStripMenuItem();
            editFromClipboardToolStripMenuItem = new ToolStripMenuItem();
            openEditorToolStripMenuItem = new ToolStripMenuItem();
            editTagsToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem7 = new ToolStripSeparator();
            copyClipboardToFileToolStripMenuItem = new ToolStripMenuItem();
            saveClipboardToFileToolStripMenuItem = new ToolStripMenuItem();
            fixClipboardImageMenuItem = new ToolStripMenuItem();
            TopMenuHelp = new ToolStripMenuItem();
            helpofflineCopyToolStripMenuItem = new ToolStripMenuItem();
            helponGithubToolStripMenuItem = new ToolStripMenuItem();
            toolStripMenuItem1 = new ToolStripMenuItem();
            websiteToolStripMenuItem = new ToolStripMenuItem();
            aboutToolStripMenuItem = new ToolStripMenuItem();
            labelInfo = new Label();
            timerCleanThumbnailList = new System.Windows.Forms.Timer(components);
            contextMenuListView.SuspendLayout();
            contextMenuSysTray.SuspendLayout();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            // 
            // textBoxLog
            // 
            textBoxLog.Location = new Point(12, 369);
            textBoxLog.Multiline = true;
            textBoxLog.Name = "textBoxLog";
            textBoxLog.ScrollBars = ScrollBars.Vertical;
            textBoxLog.Size = new Size(672, 108);
            textBoxLog.TabIndex = 5;
            // 
            // listViewThumbnails
            // 
            listViewThumbnails.AllowDrop = true;
            listViewThumbnails.ContextMenuStrip = contextMenuListView;
            listViewThumbnails.Location = new Point(12, 27);
            listViewThumbnails.Name = "listViewThumbnails";
            listViewThumbnails.Size = new Size(673, 324);
            listViewThumbnails.TabIndex = 0;
            listViewThumbnails.UseCompatibleStateImageBehavior = false;
            listViewThumbnails.SizeChanged += ListViewThumbnails_SizeChanged;
            listViewThumbnails.DragDrop += ListViewThumbnails_DragDrop;
            listViewThumbnails.DragEnter += ListViewThumbnails_DragEnter;
            listViewThumbnails.DoubleClick += ListView1_DoubleClick;
            listViewThumbnails.KeyDown += ListView1_KeyDown;
            listViewThumbnails.MouseDown += ListViewThumbnails_MouseDown;
            // 
            // contextMenuListView
            // 
            contextMenuListView.Items.AddRange(new ToolStripItem[] { itemOpenImage, itemOpenFileInExplorer, itemOpenFolder, itemDeleteFile, itemRename, itemRemove, copyToClipboardToolStripMenuItem, copyFileToolStripMenuItem, editImageToolStripMenuItem, convertFileFormatToolStripMenuItem });
            contextMenuListView.Name = "contextMenuListView";
            contextMenuListView.Size = new Size(239, 246);
            contextMenuListView.Opening += ContextMenuListView_Opening;
            // 
            // itemOpenImage
            // 
            itemOpenImage.Name = "itemOpenImage";
            itemOpenImage.Size = new Size(238, 22);
            itemOpenImage.Text = "&Open Image";
            itemOpenImage.Click += ItemOpenImage_Click;
            // 
            // itemOpenFileInExplorer
            // 
            itemOpenFileInExplorer.Name = "itemOpenFileInExplorer";
            itemOpenFileInExplorer.Size = new Size(238, 22);
            itemOpenFileInExplorer.Text = "&Show File in Explorer";
            itemOpenFileInExplorer.Click += ItemOpenFileInExplorer_Click;
            // 
            // itemOpenFolder
            // 
            itemOpenFolder.Name = "itemOpenFolder";
            itemOpenFolder.Size = new Size(238, 22);
            itemOpenFolder.Text = "Open &Folder in Explorer";
            itemOpenFolder.Click += ItemOpenFolder_Click;
            // 
            // itemDeleteFile
            // 
            itemDeleteFile.Name = "itemDeleteFile";
            itemDeleteFile.Size = new Size(238, 22);
            itemDeleteFile.Text = "&Delete File";
            itemDeleteFile.Click += ItemDeleteFile_Click;
            // 
            // itemRename
            // 
            itemRename.Name = "itemRename";
            itemRename.Size = new Size(238, 22);
            itemRename.Text = "Rename / Move File";
            itemRename.Click += ItemRenameFile_Click;
            // 
            // itemRemove
            // 
            itemRemove.Name = "itemRemove";
            itemRemove.Size = new Size(238, 22);
            itemRemove.Text = "&Remove (don't delete)";
            itemRemove.Click += ItemRemove_Click;
            // 
            // copyToClipboardToolStripMenuItem
            // 
            copyToClipboardToolStripMenuItem.Name = "copyToClipboardToolStripMenuItem";
            copyToClipboardToolStripMenuItem.Size = new Size(238, 22);
            copyToClipboardToolStripMenuItem.Text = "&Copy to Clipboard";
            copyToClipboardToolStripMenuItem.Click += CopyToClipboardToolStripMenuItem_Click;
            // 
            // copyFileToolStripMenuItem
            // 
            copyFileToolStripMenuItem.Name = "copyFileToolStripMenuItem";
            copyFileToolStripMenuItem.Size = new Size(238, 22);
            copyFileToolStripMenuItem.Text = "Cop&y Files";
            copyFileToolStripMenuItem.Click += CopyFileMenuItem_Click;
            // 
            // editImageToolStripMenuItem
            // 
            editImageToolStripMenuItem.Name = "editImageToolStripMenuItem";
            editImageToolStripMenuItem.Size = new Size(238, 22);
            editImageToolStripMenuItem.Text = "&Edit Image";
            editImageToolStripMenuItem.Click += EditImageFromFile_Click;
            // 
            // convertFileFormatToolStripMenuItem
            // 
            convertFileFormatToolStripMenuItem.Name = "convertFileFormatToolStripMenuItem";
            convertFileFormatToolStripMenuItem.Size = new Size(238, 22);
            convertFileFormatToolStripMenuItem.Text = "Convert to &PDF or other format";
            convertFileFormatToolStripMenuItem.Click += ConvertFileFormat_Click;
            // 
            // notifyIcon1
            // 
            notifyIcon1.BalloonTipIcon = ToolTipIcon.Warning;
            notifyIcon1.BalloonTipText = "No capture done";
            notifyIcon1.BalloonTipTitle = "Problem";
            notifyIcon1.ContextMenuStrip = contextMenuSysTray;
            notifyIcon1.Icon = (Icon)resources.GetObject("notifyIcon1.Icon");
            notifyIcon1.Text = "Screenshot Tool";
            notifyIcon1.Visible = true;
            notifyIcon1.BalloonTipClicked += NotifyIcon1_BalloonTipClicked;
            notifyIcon1.DoubleClick += NotifyIcon1_DoubleClick;
            // 
            // contextMenuSysTray
            // 
            contextMenuSysTray.Items.AddRange(new ToolStripItem[] { helpToolStripMenuItem, openProgramToolStripMenuItem, optionsToolStripMenuItem, editorToolStripMenuItem, editTagsToolStripMenuItem1, enableCroppingToolStripMenuItem, toolStripMenuItem4, toolStripMenuItem3, copyClipboardImageToFileDropToolStripMenuItem, toolStripMenuItem8, toolStripMenuItem5, openLastUsedFolderToolStripMenuItem, pToolStripMenuItem, toolStripMenuItem6, exitApplicationToolStripMenuItem });
            contextMenuSysTray.Name = "contextMenuSysTray";
            contextMenuSysTray.ShowImageMargin = false;
            contextMenuSysTray.Size = new Size(255, 286);
            // 
            // helpToolStripMenuItem
            // 
            helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            helpToolStripMenuItem.Size = new Size(254, 22);
            helpToolStripMenuItem.Text = "Help";
            helpToolStripMenuItem.Click += HelpToolStripMenuItem_Click;
            // 
            // openProgramToolStripMenuItem
            // 
            openProgramToolStripMenuItem.Name = "openProgramToolStripMenuItem";
            openProgramToolStripMenuItem.Size = new Size(254, 22);
            openProgramToolStripMenuItem.Text = "Open &Program";
            openProgramToolStripMenuItem.Click += OpenProgramToolStripMenuItem_Click;
            // 
            // optionsToolStripMenuItem
            // 
            optionsToolStripMenuItem.Name = "optionsToolStripMenuItem";
            optionsToolStripMenuItem.ShortcutKeyDisplayString = "";
            optionsToolStripMenuItem.Size = new Size(254, 22);
            optionsToolStripMenuItem.Text = "&Options";
            optionsToolStripMenuItem.Click += ButtonOptions_Click;
            // 
            // editorToolStripMenuItem
            // 
            editorToolStripMenuItem.Name = "editorToolStripMenuItem";
            editorToolStripMenuItem.Size = new Size(254, 22);
            editorToolStripMenuItem.Text = "Editor";
            editorToolStripMenuItem.Click += EditorToolStripMenuItem_Click;
            // 
            // editTagsToolStripMenuItem1
            // 
            editTagsToolStripMenuItem1.Name = "editTagsToolStripMenuItem1";
            editTagsToolStripMenuItem1.Size = new Size(254, 22);
            editTagsToolStripMenuItem1.Text = "Edit Tags";
            editTagsToolStripMenuItem1.Click += ShowTagView_Click;
            // 
            // enableCroppingToolStripMenuItem
            // 
            enableCroppingToolStripMenuItem.Name = "enableCroppingToolStripMenuItem";
            enableCroppingToolStripMenuItem.Size = new Size(254, 22);
            enableCroppingToolStripMenuItem.Text = "Enable &Cropping";
            enableCroppingToolStripMenuItem.Click += EnableCroppingToolStripMenuItem_Click;
            // 
            // toolStripMenuItem4
            // 
            toolStripMenuItem4.Name = "toolStripMenuItem4";
            toolStripMenuItem4.Size = new Size(251, 6);
            // 
            // toolStripMenuItem3
            // 
            toolStripMenuItem3.Name = "toolStripMenuItem3";
            toolStripMenuItem3.Size = new Size(254, 22);
            toolStripMenuItem3.Text = "Save clipboard image to file";
            toolStripMenuItem3.Click += SaveClipboardToFileToolStripMenuItem_Click;
            // 
            // copyClipboardImageToFileDropToolStripMenuItem
            // 
            copyClipboardImageToFileDropToolStripMenuItem.Name = "copyClipboardImageToFileDropToolStripMenuItem";
            copyClipboardImageToFileDropToolStripMenuItem.Size = new Size(254, 22);
            copyClipboardImageToFileDropToolStripMenuItem.Text = "Copy clipboard image to file drop";
            copyClipboardImageToFileDropToolStripMenuItem.Click += CopyClipboardToFileToolStripMenuItem_Click;
            // 
            // toolStripMenuItem8
            // 
            toolStripMenuItem8.Name = "toolStripMenuItem8";
            toolStripMenuItem8.Size = new Size(254, 22);
            toolStripMenuItem8.Text = "Fix clipboard image (more compatible)";
            toolStripMenuItem8.Click += FixClipboardImageMenuItem_Click;
            // 
            // toolStripMenuItem5
            // 
            toolStripMenuItem5.Name = "toolStripMenuItem5";
            toolStripMenuItem5.Size = new Size(251, 6);
            // 
            // openLastUsedFolderToolStripMenuItem
            // 
            openLastUsedFolderToolStripMenuItem.Name = "openLastUsedFolderToolStripMenuItem";
            openLastUsedFolderToolStripMenuItem.Size = new Size(254, 22);
            openLastUsedFolderToolStripMenuItem.Text = "Open last used &Folder";
            openLastUsedFolderToolStripMenuItem.Click += ButtonOpenLastFolder_Click;
            // 
            // pToolStripMenuItem
            // 
            pToolStripMenuItem.Name = "pToolStripMenuItem";
            pToolStripMenuItem.Size = new Size(254, 22);
            pToolStripMenuItem.Text = "Open last &Screenshot";
            pToolStripMenuItem.Click += OpenFileToolStripMenuItem_Click;
            // 
            // toolStripMenuItem6
            // 
            toolStripMenuItem6.Name = "toolStripMenuItem6";
            toolStripMenuItem6.Size = new Size(251, 6);
            // 
            // exitApplicationToolStripMenuItem
            // 
            exitApplicationToolStripMenuItem.Name = "exitApplicationToolStripMenuItem";
            exitApplicationToolStripMenuItem.Size = new Size(254, 22);
            exitApplicationToolStripMenuItem.Text = "E&xit application";
            exitApplicationToolStripMenuItem.Click += ExitApplicationToolStripMenuItem_Click;
            // 
            // timerHide
            // 
            timerHide.Tick += TimerHide_Tick;
            // 
            // labelShowLog
            // 
            labelShowLog.AutoSize = true;
            labelShowLog.Font = new Font("Segoe UI", 7F);
            labelShowLog.Location = new Point(242, 354);
            labelShowLog.Name = "labelShowLog";
            labelShowLog.Size = new Size(42, 12);
            labelShowLog.TabIndex = 35;
            labelShowLog.Text = "Hide log";
            labelShowLog.Click += LabelShowLog_Click;
            // 
            // menuStrip1
            // 
            menuStrip1.Items.AddRange(new ToolStripItem[] { TopMenuProgram, TopMenuOptions, topMenuEdit, TopMenuHelp });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Size = new Size(696, 24);
            menuStrip1.TabIndex = 36;
            menuStrip1.Text = "menuStrip1";
            // 
            // TopMenuProgram
            // 
            TopMenuProgram.DropDownItems.AddRange(new ToolStripItem[] { clearListToolStripMenuItem, openLastUsedFolderToolStripMenuItem1, hideApplicationToolStripMenuItem, resetCounterToolStripMenuItem, toggleCropToolStripMenuItem, toolStripMenuItem2, exitToolStripMenuItem });
            TopMenuProgram.Name = "TopMenuProgram";
            TopMenuProgram.Size = new Size(65, 20);
            TopMenuProgram.Text = "&Program";
            // 
            // clearListToolStripMenuItem
            // 
            clearListToolStripMenuItem.Name = "clearListToolStripMenuItem";
            clearListToolStripMenuItem.Size = new Size(186, 22);
            clearListToolStripMenuItem.Text = "C&lear list";
            clearListToolStripMenuItem.Click += ButtonClearList_Click;
            // 
            // openLastUsedFolderToolStripMenuItem1
            // 
            openLastUsedFolderToolStripMenuItem1.Name = "openLastUsedFolderToolStripMenuItem1";
            openLastUsedFolderToolStripMenuItem1.Size = new Size(186, 22);
            openLastUsedFolderToolStripMenuItem1.Text = "Open last used &folder";
            openLastUsedFolderToolStripMenuItem1.Click += ButtonOpenLastFolder_Click;
            // 
            // hideApplicationToolStripMenuItem
            // 
            hideApplicationToolStripMenuItem.Name = "hideApplicationToolStripMenuItem";
            hideApplicationToolStripMenuItem.Size = new Size(186, 22);
            hideApplicationToolStripMenuItem.Text = "&Hide application";
            hideApplicationToolStripMenuItem.Click += ButtonHide_Click;
            // 
            // resetCounterToolStripMenuItem
            // 
            resetCounterToolStripMenuItem.Name = "resetCounterToolStripMenuItem";
            resetCounterToolStripMenuItem.Size = new Size(186, 22);
            resetCounterToolStripMenuItem.Text = "&Reset counter";
            resetCounterToolStripMenuItem.Click += ResetCounterToolStripMenuItem_Click;
            // 
            // toggleCropToolStripMenuItem
            // 
            toggleCropToolStripMenuItem.Name = "toggleCropToolStripMenuItem";
            toggleCropToolStripMenuItem.Size = new Size(186, 22);
            toggleCropToolStripMenuItem.Text = "Enable &Cropping";
            toggleCropToolStripMenuItem.Click += EnableCroppingToolStripMenuItem_Click;
            // 
            // toolStripMenuItem2
            // 
            toolStripMenuItem2.Name = "toolStripMenuItem2";
            toolStripMenuItem2.Size = new Size(183, 6);
            // 
            // exitToolStripMenuItem
            // 
            exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            exitToolStripMenuItem.Size = new Size(186, 22);
            exitToolStripMenuItem.Text = "E&xit";
            exitToolStripMenuItem.Click += ExitToolStripMenuItem_Click;
            // 
            // TopMenuOptions
            // 
            TopMenuOptions.Name = "TopMenuOptions";
            TopMenuOptions.Size = new Size(61, 20);
            TopMenuOptions.Text = "&Options";
            TopMenuOptions.Click += ButtonOptions_Click;
            // 
            // topMenuEdit
            // 
            topMenuEdit.DropDownItems.AddRange(new ToolStripItem[] { editSelectedFileToolStripMenuItem, editFromClipboardToolStripMenuItem, openEditorToolStripMenuItem, editTagsToolStripMenuItem, toolStripMenuItem7, copyClipboardToFileToolStripMenuItem, saveClipboardToFileToolStripMenuItem, fixClipboardImageMenuItem });
            topMenuEdit.Name = "topMenuEdit";
            topMenuEdit.Size = new Size(39, 20);
            topMenuEdit.Text = "&Edit";
            // 
            // editSelectedFileToolStripMenuItem
            // 
            editSelectedFileToolStripMenuItem.Name = "editSelectedFileToolStripMenuItem";
            editSelectedFileToolStripMenuItem.Size = new Size(279, 22);
            editSelectedFileToolStripMenuItem.Text = "Edit selected &file";
            editSelectedFileToolStripMenuItem.Click += EditImageFromFile_Click;
            // 
            // editFromClipboardToolStripMenuItem
            // 
            editFromClipboardToolStripMenuItem.Name = "editFromClipboardToolStripMenuItem";
            editFromClipboardToolStripMenuItem.Size = new Size(279, 22);
            editFromClipboardToolStripMenuItem.Text = "Edit from &clipboard";
            editFromClipboardToolStripMenuItem.Click += EditImageFromClipboard_Click;
            // 
            // openEditorToolStripMenuItem
            // 
            openEditorToolStripMenuItem.Name = "openEditorToolStripMenuItem";
            openEditorToolStripMenuItem.Size = new Size(279, 22);
            openEditorToolStripMenuItem.Text = "Open &editor";
            openEditorToolStripMenuItem.Click += EditImageNoFile_Click;
            // 
            // editTagsToolStripMenuItem
            // 
            editTagsToolStripMenuItem.Name = "editTagsToolStripMenuItem";
            editTagsToolStripMenuItem.Size = new Size(279, 22);
            editTagsToolStripMenuItem.Text = "Edit Tags";
            editTagsToolStripMenuItem.Click += ShowTagView_Click;
            // 
            // toolStripMenuItem7
            // 
            toolStripMenuItem7.Name = "toolStripMenuItem7";
            toolStripMenuItem7.Size = new Size(276, 6);
            // 
            // copyClipboardToFileToolStripMenuItem
            // 
            copyClipboardToFileToolStripMenuItem.Name = "copyClipboardToFileToolStripMenuItem";
            copyClipboardToFileToolStripMenuItem.Size = new Size(279, 22);
            copyClipboardToFileToolStripMenuItem.Text = "Copy clipboard image to file drop";
            copyClipboardToFileToolStripMenuItem.Click += CopyClipboardToFileToolStripMenuItem_Click;
            // 
            // saveClipboardToFileToolStripMenuItem
            // 
            saveClipboardToFileToolStripMenuItem.Name = "saveClipboardToFileToolStripMenuItem";
            saveClipboardToFileToolStripMenuItem.Size = new Size(279, 22);
            saveClipboardToFileToolStripMenuItem.Text = "Save clipboard image to file";
            saveClipboardToFileToolStripMenuItem.Click += SaveClipboardToFileToolStripMenuItem_Click;
            // 
            // fixClipboardImageMenuItem
            // 
            fixClipboardImageMenuItem.Name = "fixClipboardImageMenuItem";
            fixClipboardImageMenuItem.Size = new Size(279, 22);
            fixClipboardImageMenuItem.Text = "Fix clipboard image (more compatible)";
            fixClipboardImageMenuItem.Click += FixClipboardImageMenuItem_Click;
            // 
            // TopMenuHelp
            // 
            TopMenuHelp.DropDownItems.AddRange(new ToolStripItem[] { helpofflineCopyToolStripMenuItem, helponGithubToolStripMenuItem, toolStripMenuItem1, websiteToolStripMenuItem, aboutToolStripMenuItem });
            TopMenuHelp.Name = "TopMenuHelp";
            TopMenuHelp.Size = new Size(44, 20);
            TopMenuHelp.Text = "&Help";
            // 
            // helpofflineCopyToolStripMenuItem
            // 
            helpofflineCopyToolStripMenuItem.Name = "helpofflineCopyToolStripMenuItem";
            helpofflineCopyToolStripMenuItem.Size = new Size(220, 22);
            helpofflineCopyToolStripMenuItem.Text = "&Help";
            helpofflineCopyToolStripMenuItem.Click += HelpofflineCopyToolStripMenuItem_Click;
            // 
            // helponGithubToolStripMenuItem
            // 
            helponGithubToolStripMenuItem.Name = "helponGithubToolStripMenuItem";
            helponGithubToolStripMenuItem.Size = new Size(220, 22);
            helponGithubToolStripMenuItem.Text = "&Documentation (on github)";
            helponGithubToolStripMenuItem.Click += HelponGithubToolStripMenuItem_Click;
            // 
            // toolStripMenuItem1
            // 
            toolStripMenuItem1.Name = "toolStripMenuItem1";
            toolStripMenuItem1.Size = new Size(220, 22);
            toolStripMenuItem1.Text = "&Version changelog";
            toolStripMenuItem1.Click += ChangelogToolStripMenuItem_Click;
            // 
            // websiteToolStripMenuItem
            // 
            websiteToolStripMenuItem.Name = "websiteToolStripMenuItem";
            websiteToolStripMenuItem.Size = new Size(220, 22);
            websiteToolStripMenuItem.Text = "&Website";
            websiteToolStripMenuItem.Click += WebsiteToolStripMenuItem_Click;
            // 
            // aboutToolStripMenuItem
            // 
            aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            aboutToolStripMenuItem.Size = new Size(220, 22);
            aboutToolStripMenuItem.Text = "&About";
            aboutToolStripMenuItem.Click += AboutToolStripMenuItem_Click;
            // 
            // labelInfo
            // 
            labelInfo.AllowDrop = true;
            labelInfo.BackColor = Color.White;
            labelInfo.Font = new Font("Courier New", 9F);
            labelInfo.ForeColor = Color.Gray;
            labelInfo.Location = new Point(144, 99);
            labelInfo.Name = "labelInfo";
            labelInfo.Size = new Size(401, 138);
            labelInfo.TabIndex = 37;
            labelInfo.Text = "To take a screenshot use hotkeys";
            labelInfo.DragDrop += ListViewThumbnails_DragDrop;
            labelInfo.DragEnter += ListViewThumbnails_DragEnter;
            // 
            // timerCleanThumbnailList
            // 
            timerCleanThumbnailList.Enabled = true;
            timerCleanThumbnailList.Interval = 5000;
            timerCleanThumbnailList.Tick += TimerCleanThumbnailList_Tick;
            // 
            // MainForm
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(696, 489);
            Controls.Add(labelInfo);
            Controls.Add(menuStrip1);
            Controls.Add(labelShowLog);
            Controls.Add(listViewThumbnails);
            Controls.Add(textBoxLog);
            Icon = (Icon)resources.GetObject("$this.Icon");
            MainMenuStrip = menuStrip1;
            MinimumSize = new Size(500, 300);
            Name = "MainForm";
            Text = "Screenshot Tool";
            FormClosing += Form1_FormClosing;
            Load += MainForm_Load;
            SizeChanged += MainForm_SizeChanged;
            contextMenuListView.ResumeLayout(false);
            contextMenuSysTray.ResumeLayout(false);
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox textBoxLog;
        private FolderBrowserDialog folderBrowserDialog1;
        private ListView listViewThumbnails;
        private NotifyIcon notifyIcon1;
        private System.Windows.Forms.Timer timerHide;
        private ContextMenuStrip contextMenuSysTray;
        private ToolStripMenuItem openProgramToolStripMenuItem;
        private ToolStripMenuItem optionsToolStripMenuItem;
        private ToolStripMenuItem openLastUsedFolderToolStripMenuItem;
        private ToolStripMenuItem pToolStripMenuItem;
        private ToolStripMenuItem exitApplicationToolStripMenuItem;
        private ToolStripMenuItem enableCroppingToolStripMenuItem;
        private Label labelShowLog;
        private ContextMenuStrip contextMenuListView;
        private ToolStripMenuItem itemOpenImage;
        private ToolStripMenuItem itemOpenFolder;
        private ToolStripMenuItem itemDeleteFile;
        private ToolStripMenuItem itemRemove;
        private ToolStripMenuItem copyToClipboardToolStripMenuItem;
        private MenuStrip menuStrip1;
        private ToolStripMenuItem TopMenuProgram;
        private ToolStripMenuItem clearListToolStripMenuItem;
        private ToolStripMenuItem openLastUsedFolderToolStripMenuItem1;
        private ToolStripMenuItem hideApplicationToolStripMenuItem;
        private ToolStripMenuItem TopMenuHelp;
        private ToolStripMenuItem resetCounterToolStripMenuItem;
        private ToolStripMenuItem toggleCropToolStripMenuItem;
        private ToolStripSeparator toolStripMenuItem2;
        private ToolStripMenuItem exitToolStripMenuItem;
        private ToolStripMenuItem helpofflineCopyToolStripMenuItem;
        private ToolStripMenuItem helponGithubToolStripMenuItem;
        private ToolStripMenuItem websiteToolStripMenuItem;
        private ToolStripMenuItem aboutToolStripMenuItem;
        private ToolStripMenuItem TopMenuOptions;
        private ToolStripMenuItem copyFileToolStripMenuItem;
        private Label labelInfo;
        private ToolStripMenuItem editImageToolStripMenuItem;
        private ToolStripMenuItem topMenuEdit;
        private ToolStripMenuItem editSelectedFileToolStripMenuItem;
        private ToolStripMenuItem editFromClipboardToolStripMenuItem;
        private ToolStripMenuItem openEditorToolStripMenuItem;
        private ToolStripMenuItem editorToolStripMenuItem;
        private ToolStripMenuItem helpToolStripMenuItem;
        private ToolStripMenuItem convertFileFormatToolStripMenuItem;
        private ToolStripMenuItem editTagsToolStripMenuItem;
        private ToolStripMenuItem editTagsToolStripMenuItem1;
        private ToolStripMenuItem itemOpenFileInExplorer;
        private ToolStripMenuItem toolStripMenuItem1;
        private ToolStripMenuItem copyClipboardToFileToolStripMenuItem;
        private ToolStripMenuItem saveClipboardToFileToolStripMenuItem;
        private ToolStripMenuItem copyClipboardImageToFileDropToolStripMenuItem;
        private ToolStripMenuItem toolStripMenuItem3;
        private ToolStripSeparator toolStripMenuItem4;
        private ToolStripSeparator toolStripMenuItem5;
        private ToolStripSeparator toolStripMenuItem6;
        private ToolStripSeparator toolStripMenuItem7;
        private ToolStripMenuItem fixClipboardImageMenuItem;
        private ToolStripMenuItem toolStripMenuItem8;
        private ToolStripMenuItem itemRename;
        private System.Windows.Forms.Timer timerCleanThumbnailList;
    }
}