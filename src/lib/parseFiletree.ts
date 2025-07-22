export type File = {
  name: string;
  content: string;
  type: "file";
  originPath:string;
};

export type Folder = {
  name: string;
  content: Array<File | Folder>;
  type: "folder";
};

export type FileTree = Folder[];

/**
 * Converts a flat Record of file paths to a nested folder-file structure.
 *
 * @param files - A map of filepath -> file content
 * @returns A nested folder/file structure as a FileTree
 */
export function parseFileTree(files: Record<string, string>): FileTree {
  const project: FileTree = [
    {
      name: "src",
      content: [],
      type: "folder",
    },
  ];

  const addFile = (
    folder: Array<File | Folder>,
    path: string,
    content: string,
    originPath:string
  ): void => {
    const pathArray = path.split("/");
    const name = pathArray[0];

    if (pathArray.length === 1) {
      folder.push({ name, content, type: "file" ,originPath});
      return;
    }

    let nextFolder = folder.find(
      (f): f is Folder => f.name === name && f.type === "folder"
    );

    if (!nextFolder) {
      nextFolder = { name, content: [], type: "folder"};
      folder.push(nextFolder);
    }

    pathArray.shift();
    addFile(nextFolder.content, pathArray.join("/"), content, originPath);
  };

  for (const [path, content] of Object.entries(files)) {
    addFile(project[0].content, path, content, path);
  }

  return project;
}
