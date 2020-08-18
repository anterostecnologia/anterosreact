import { observable, action, toJS, runInAction } from 'mobx';
import { guid, findIndex } from '../lib/util';
import { record } from '../lib/history';
import { DesignType, OperationMode, Position, ExtensionGroupGeneral } from '../lib/enum';
import { bodyValues, rowValues } from '../lib/values';

class DesignState {

  constructor(transparent) {
    this.transparent = transparent;
    this.extensionGroups.add(ExtensionGroupGeneral);
  }

  @record()
  @action
  execCommand(method, ...rest) {
    this[method] && this[method](...rest);
  }

  @observable
  data = {
    body: {
      rows: [],
      values: {
        ...bodyValues,
        _meta: {
          guid: this.guid(),
          type: DesignType.BODY
        }
      }
    }
  };

  @observable
  selected = null;

  @action
  setSelected(guid) {
    if (guid === this.selected) {
      return;
    }
    this.selected = null;
    setTimeout(() => {
      runInAction(() => {
        this.selected = guid;
      });
    });
  }

  @action
  deleteSelected() {
    if (!this.selected) return;
    if (this.getContent(this.selected)) {
      this.execCommand('deleteContent', this.selected);
    } else {
      this.execCommand('deleteRow', this.selected);
    }
  }

  @observable
  extensions = [];

  @action
  addExtension(extension) {
    this.extensions.push(extension);
  }

  getExtension(type) {
    return this.extensions.find(i => i.type === type);
  }

  getExtensions() {
    return toJS(this.extensions);
  }

  extensionGroups = new Set();

  @action
  addExtensionGroup(group) {
    this.extensionGroups.add(group);
  }

  getExtensionGroups() {
    return Array.from(this.extensionGroups);
  }

  attribute = {};

  setAttribute(type, attribute) {
    this.attribute[type] = attribute;
  }

  getData() {
    return toJS(this.data);
  }

  @action
  setData(json) {
    this.setSelected(null);
    this.data = json;
    this.compatibleWithOldData();
  }

  @action
  compatibleWithOldData() {
    this.data.body.rows.forEach(row => {
      row.columns.forEach(column => {
        column.contents.forEach(content => {
          const Extension = this.getExtension(content.values._meta.subtype);
          if (Extension) {
            const initAttributes = (new Extension({})).getInitialAttribute();
            content.values = { ...initAttributes, ...content.values };
          }
        });
      });
    });
  }

  @action
  addRow(row) {
    this.data.body.rows.push({
      cells: row.cells,
      columns: row.cells.map(i => ({
        contents: [],
        values: {
          _meta: {
            guid: this.guid(),
            type: DesignType.COLUMN
          }
        }
      })),
      values: {
        ...rowValues,
        _meta: {
          guid: this.guid(),
          type: DesignType.ROW,
          subtype: row.type,
        }
      }
    });
  }

  @action
  insertRow(row, guid, position = Position.BEFORE) {
    const index = findIndex(this.data.body.rows, row => row.values._meta.guid === guid);
    this.data.body.rows.splice(position === Position.BEFORE ? index : index + 1, 0, {
      cells: row.cells,
      columns: row.cells.map(i => ({
        contents: [],
        values: {
          _meta: {
            guid: this.guid(),
            type: DesignType.COLUMN
          }
        }
      })),
      values: {
        ...rowValues,
        _meta: {
          guid: this.guid(),
          type: DesignType.ROW,
          subtype: row.type,
        }
      }
    });
  }

  @action
  moveRow(row, offsetGuid, position = Position.BEFORE) {
    const moveGuid = row.guid;
    const rows = this.data.body.rows;
    const index = findIndex(rows, row => row.values._meta.guid === moveGuid);
    const rowData = rows.splice(index, 1)[0];
    if (offsetGuid) {
      const offsetIndex = findIndex(rows, row => row.values._meta.guid === offsetGuid);
      rows.splice(position === Position.BEFORE ? offsetIndex : offsetIndex + 1, 0, rowData);
    } else {
      rows.push(rowData);
    }
  }

  @action
  addContent(content, meta) {
    this.data.body.rows.forEach((row, index) => {
      const column = row.columns.filter(column => column.values._meta.guid === meta.guid)[0];
      if (column) {
        column.contents.push({
          values: {
            ...this.attribute[content.type],
            _meta: {
              guid: this.guid(),
              subtype: content.type,
              type: DesignType.CONTENT
            }
          }
        });
      }
    });
  }

  @action
  insertContent(content, offsetGuid, columnGuid, position = Position.BEFORE) {
    this.data.body.rows.forEach((row, index) => {
      const column = row.columns.filter(column => column.values._meta.guid === columnGuid)[0];
      if (column) {
        const index = findIndex(column.contents, content => content.values._meta.guid === offsetGuid);
        column.contents.splice(position === Position.BEFORE ? index : index + 1, 0, {
          values: {
            ...this.attribute[content.type],
            _meta: {
              guid: this.guid(),
              subtype: content.type,
              type: DesignType.CONTENT
            }
          }
        });
      }
    });
  }

  @action
  moveContent(content, offsetGuid, columnGuid, position = Position.BEFORE) {
    // get and remove content from old position
    const contentData = this.getContent(content.guid, OperationMode.REMOVE);
    this.data.body.rows.some(row => {
      const column = row.columns.filter(column => column.values._meta.guid === columnGuid)[0];
      if (column) {
        const contents = column.contents;

        if (offsetGuid) {
          const offsetIndex = findIndex(contents, content => content.values._meta.guid === offsetGuid);
          contents.splice(position === Position.BEFORE ? offsetIndex : offsetIndex + 1, 0, contentData);
        } else {
          contents.push(contentData);
        }
        return true;
      }
      return false;
    });
  }

  @action
  getContent(guid, operation) {
    let content = null;
    this.data.body.rows.some(row => {
      row.columns.some(column => {
        content = column.contents.filter(content => content.values._meta.guid === guid)[0];
        if (content && operation) {
          const index = findIndex(column.contents, content => content.values._meta.guid === guid);
          if (operation === OperationMode.REMOVE) {
            column.contents.splice(index, 1);
          } else if (operation === OperationMode.COPY) {
            const copy = JSON.parse(JSON.stringify(content));
            copy.values._meta.guid = this.guid();
            column.contents.splice(index + 1, 0, copy);
          }
        }
        return !!content;
      });
      return !!content;
    });
    return content;
  }

  @action
  deleteContent(guid) {
    this.getContent(guid, OperationMode.REMOVE);
    this.setSelected(null);
  }

  @action
  deleteRow(guid) {
    const index = findIndex(this.data.body.rows, row => row.values._meta.guid === guid);
    this.data.body.rows.splice(index, 1);
    this.setSelected(null);
  }

  @action
  copyContent(guid) {
    this.getContent(guid, OperationMode.COPY);
  }

  @action
  copyRow(guid) {
    const row = this.getRow(guid);
    const index = findIndex(this.data.body.rows, row => row.values._meta.guid === guid);
    const copy = JSON.parse(JSON.stringify(row));
    copy.values._meta.guid = this.guid();
    copy.columns.forEach(column => {
      column.values._meta.guid = this.guid();
      column.contents.forEach(content => {
        content.values._meta.guid = this.guid();
      });
    });
    this.data.body.rows.splice(index + 1, 0, copy);
  }

  getRow(guid) {
    return this.data.body.rows.filter(row => row.values._meta.guid === guid)[0];
  }

  getColumn(guid) {
    let column = null;
    this.data.body.rows.some(row => {
      column = row.columns.filter(column => column.values._meta.guid === guid)[0];
      return !!column;
    });
    return column;
  }

  @record(400)
  @action
  updateAttribute(guid, key, value) {
    const data = this.getRow(guid) || this.getContent(guid);
    if (data) {
      data.values = { ...data.values, ...{ [key]: value } };
    }
  }

  @record(400)
  @action
  updateBodyAttribute(key, value) {
    const data = this.data.body;
    if (data) {
      data.values = { ...data.values, ...{ [key]: value } };
    }
  }

  getDataByGuid(guid) {
    return this.getRow(guid) || this.getContent(guid);
  }

  guid() {
    return guid();
  }

}

export default DesignState;