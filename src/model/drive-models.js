export class FileList {
  constructor(files) {
    this.kind = 'drive#fileList';
    this.files = files;
  }
}

export class MediaNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MediaNotFoundError';
    this.message = message;
  }
}

//  public static class ImageMediaMetadata {
//         public int width;
//         public int height;
//     }

//     public static class VideoMediaMetadata {
//         public int width;
//         public int height;
//         public long durationMillis;
//     }

//     public final String kind = "drive#file";
//     public String id;
//     public String name;
//     public String mimeType;
//     public String description;
//     //public List<String> parents;
//     public String thumbnailLink;
// "yyyy-MM-dd'T'HH:mm:ssZ
//     public Date createTime;
//     public String fullFileExtension;
//     public Long size;
//     public ContentHints contentHints;

//     public transient String contentLink;

//     public ImageMediaMetadata imageMediaMetadata;
//     public VideoMediaMetadata videoMediaMetadata;
export class NewFileModel {
  static validate(json, fileId) {
    try {
      const file = JSON.parse(json);

      if (!file) {
        // console.log(`invalid json: ${json}`);
        return undefined;
      }

      if (!file.mimeType) {
        return undefined;
      }

      return {
        id: fileId,
        kind: 'drive#file',
        name: file.name,
        mimeType: file.mimeType,
        description: file.description,
        contentHints: file.contentHints,
        ImageMediaMetadata: file.ImageMediaMetadata,
        VideoMediaMetadata: file.VideoMediaMetadata,
        createTime: new Date(Date.now()).toISOString(),
      };
    } catch (e) {
      return undefined;
    }
  }
}

export class UpdateFileModel {
  static validate(json) {
    try {
      // console.log(`checking ${json}`);
      const file = JSON.parse(json);

      if (!file.name) {
        return undefined;
      }

      return file;
    } catch (e) {
      return undefined;
    }
  }
}

export function createThumbnailId(fileId) {
  return `${fileId}.thumb`;
}

export function validId(id) {
  return id && (id.match('[\\/:*?"<>|]') === null);
}
