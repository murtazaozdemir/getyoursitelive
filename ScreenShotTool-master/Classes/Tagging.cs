using ScreenShotTool.Forms;
using ScreenShotTool.Properties;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.Versioning;
using System.Text;

namespace ScreenShotTool.Classes;

[SupportedOSPlatform("windows")]

public class Tagging
{
    TagView? tagView;
    public List<InfoTag> CaptureTags = [];
    public List<InfoTagCategory> CaptureTagCategories = [];

    public Tagging()
    {
    }

    public BindingList<InfoTag> FilteredTags(string filter)
    {
        return ToBindingList((CaptureTags.Where(x => x.Enabled || x.Category.Contains(filter, StringComparison.InvariantCultureIgnoreCase))));
    }

    public static BindingList<T> ToBindingList<T>(IEnumerable<T> range)
    {
        return new BindingList<T>(range.ToList());
    }

    public void LoadTagData()
    {
        CaptureTags.Clear();
        CaptureTagCategories.Clear();
        string tagDataFolder = Environment.ExpandEnvironmentVariables(Settings.Default.TagDataFolder);

        // Load tags if folder exists
        if (Directory.Exists(tagDataFolder))
        {
            string tagFile = Path.Join(tagDataFolder, "tags.txt");
            if (File.Exists(tagFile) == false)
            {
                Debug.WriteLine($"Can't find tag file: {tagFile}");
            }
            else
            {
                string[] tagLines = File.ReadAllLines(tagFile);
                foreach (string line in tagLines)
                {
                    if (line.Length < 2)
                    {
                        Debug.WriteLine($"Invalid data on line, too short, aborting");
                        break;
                    }
                    else
                    {
                        bool enabled = false;
                        string name = "unnamed";
                        string description = "";
                        string category = "";
                        string[] sections = line.Split(";");

                        if (sections.Length < 2)
                        {
                            Debug.WriteLine("Too few sections on line");
                        }
                        else
                        {
                            if (sections.Length >= 1)
                            {
                                if (sections[0] == "True")
                                    enabled = true;
                            }
                            if (sections.Length >= 2)
                            {
                                name = sections[1];
                            }
                            if (sections.Length >= 3)
                            {
                                description = sections[2];
                            }
                            if (sections.Length >= 4)
                            {
                                category = sections[3];
                            }
                            InfoTag tag = new(enabled, name, description, category);
                            CaptureTags.Add(tag);
                            //Debug.WriteLine($"Added tag: {enabled}, '{name}' in category '{category}', description: '{description}'");
                        }


                    }
                }
            }
        }
        else
        {
            Debug.WriteLine("Couldn't load tag data folder");
        }
        if (CaptureTags.Count == 0)
        {
            CaptureTags.Add(new InfoTag(false, ""));
        }
    }

    public void SaveTagData()
    {
        string tagDataFolder = Environment.ExpandEnvironmentVariables(Settings.Default.TagDataFolder);
        if (Directory.Exists(tagDataFolder) == false)
        {
            try
            {
                Debug.WriteLine($"Couldn't create find Tag Data Folder, creating the folder: {tagDataFolder}");
                Directory.CreateDirectory(tagDataFolder);
            }
            catch (Exception e)
            {
                Debug.WriteLine($"Couldn't create Tag Data Folder {tagDataFolder}\n: {e.Message}");
            }
        }
        // Folder should exist now
        if (Directory.Exists(tagDataFolder))
        {
            string tagFile = Path.Join(tagDataFolder, "tags.txt");
            StringBuilder sb = new();
            foreach (InfoTag tag in CaptureTags)
            {
                sb.Append(tag.Enabled);
                sb.Append($";{tag.Name}");
                sb.Append($";{tag.Description}");
                sb.AppendLine($";{tag.Category}");

            }
            try
            {
                Debug.WriteLine($"Saving to tag file: {tagFile}");
                File.WriteAllText(tagFile, sb.ToString());
            }
            catch (Exception e)
            {
                Debug.WriteLine($"Error saving to tag file {tagFile}:\n{e.Message}");
            }
        }
    }

    public string GetTagsText()
    {
        StringBuilder sb = new();
        foreach (InfoTag tag in CaptureTags)
        {
            if (tag.Enabled)
            {
                if (sb.Length > 0)
                    sb.Append(", ");
                sb.Append(tag.Name);
            }
        }
        return sb.ToString();
    }

    public void ShowTagView()
    {
        if (tagView == null || tagView.IsDisposed)
        {
            tagView = new TagView(this);
        }

        tagView.Show();
        // bring it to front
        if (tagView.TopMost == false)
        {
            tagView.TopMost = true;
            tagView.TopMost = false;
        }
        else
        {
            tagView.TopMost = false;
            tagView.TopMost = true;
        }
    }
}
