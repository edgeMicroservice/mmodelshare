export class MediaNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MediaNotFoundError';
    this.message = message;
  }
}

export class NewFileModel {
  static validate(json, fileId) {
    try {
      const file = JSON.parse(json);

      if (!file || !file.mimeType) {
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
