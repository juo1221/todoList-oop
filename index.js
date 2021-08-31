const err = (v) => {
  throw v;
};
const el = (t) => {
  return document.createElement(t);
};

const Task = class {
  static load(json) {
    const task = new Task(json.title, json.isCompleted);
    return task;
  }
  static get(title) {
    return new Task(title);
  }
  toJSON() {
    return this.getInfo();
  }
  constructor(title, isCompleted = false) {
    (this.title = title), (this.isCompleted = isCompleted);
  }
  setTitle(title) {
    this.title = title;
  }
  toggle() {
    this.isCompleted = !this.isCompleted;
  }
  getInfo() {
    return { title: this.title, isCompleted: this.isCompleted };
  }
};

const Folder = class extends Set {
  static get(title) {
    return new Folder(title);
  }
  static load(json) {
    const folder = new Folder(json.title);
    json.tasks.forEach((t) => {
      folder.addTask(Task.load(t));
    });
    return folder;
  }
  toJSON() {
    return { title: this.getTitle(), tasks: this.getTasks() };
  }
  constructor(title) {
    super();
    this.title = title;
  }
  moveTask(t, folderSrc) {
    if (super.has(t) || !folderSrc.has(t)) err("...1");
    folderSrc.removeTask(t);
    this.addTask(t);
  }
  addTask(task) {
    super.add(task);
  }
  removeTask(task) {
    super.delete(task);
  }
  getTasks() {
    return [...super.values()];
  }
  getTitle() {
    return this.title;
  }
  add() {
    arr("...");
  }
  delete() {
    arr("...");
  }
  values() {
    arr("...");
  }
  clear() {
    arr("...");
  }
};

const App = class extends Set {
  toJSON() {
    return this.getFolders();
  }
  static load(json) {
    const app = new App();
    json.forEach((f) => {
      app.addFolder(Folder.load(f));
    });
    return app;
  }
  constructor() {
    super();
  }
  addFolder(folder) {
    super.add(folder);
  }
  removeFolder(folder) {
    super.delete(folder);
  }
  getFolders() {
    return [...super.values()];
  }
  add() {
    arr("...");
  }
  delete() {
    arr("...");
  }
  values() {
    arr("...");
  }
  clear() {
    arr("...");
  }
};

const Renderer = class {
  constructor(app) {
    this.app = app;
  }
  render() {
    this._render();
  }
  _render() {
    err("must be overrided!");
  }
};

const DOMRenderer = class extends Renderer {
  constructor(parent, app) {
    super(app);
    const [folder, task] = Array.from(parent.querySelectorAll("ul"));
    const [load, save] = Array.from(parent.querySelectorAll("button"));
    load.onclick = () => {
      const v = localStorage["todo"];
      if (v) {
        this.app = App.load(JSON.parse(v));
        this.render();
      }
    };
    save.onclick = () => {
      localStorage["todo"] = JSON.stringify(this.app);
    };

    this.taskEl = [];
    this.folder = folder;
    this.task = task;
    this.currentFolder = null;

    parent.querySelector(".folder-input").addEventListener("keyup", (e) => {
      const v = e.target.value.trim();
      if (e.keyCode != 13 || !v) return;
      const folder = Folder.get(v);
      this.app.addFolder(folder);
      e.target.value = "";
      e.target.focus();
      this.render();
    });
    parent.querySelector(".task-input").addEventListener("keyup", (e) => {
      const v = e.target.value.trim();
      if (e.keyCode != 13 || !v || !this.currentFolder) return;
      const task = Task.get(v);
      this.currentFolder.addTask(task);
      e.target.value = "";
      e.target.focus();
      this.render();
    });
  }
  _render() {
    const folders = this.app.getFolders();
    let moveTask;
    if (!this.currentFolder) this.currentFolder = folders[0];
    let oldEl = this.folder.firstElementChild;
    let lastEl = null;
    let tasks;
    folders.forEach((f) => {
      let li;
      if (oldEl) {
        li = oldEl;
        oldEl = oldEl.nextElementSibling;
      } else {
        li = el("li");
        this.folder.appendChild(li);
        oldEl = null;
      }
      lastEl = li;
      li.innerHTML = f.getTitle();
      li.style.cssText =
        "font-size:" + (this.currentFolder == f ? "32px" : "20px");
      li.onclick = () => {
        this.currentFolder = f;
        this.render();
      };
      li.ondrop = (e) => {
        e.preventDefault();
        f.moveTask(moveTask, this.currentFolder);
        this.render();
      };
      li.ondragover = (e) => {
        e.preventDefault();
      };
    });
    if (lastEl)
      while ((oldEl = lastEl.nextElementSibling)) {
        this.folder.removeChild(oldEl);
      }

    if (!this.currentFolder) return;
    tasks = this.currentFolder.getTasks();
    if (tasks.length == 0) {
      while ((oldEl = this.task.firstElementChild)) {
        this.task.removeChild(oldEl);
        this.taskEl.push(oldEl);
      }
    } else {
      oldEl = this.task.firstElementChild;
      lastEl = null;
      tasks.forEach((t) => {
        let li;
        if (oldEl) {
          li = oldEl;
          oldEl = oldEl.nextElementSibling;
        } else {
          li = this.taskEl.length ? this.taskEl.pop() : el("li");
          oldEl = null;
          this.task.appendChild(li);
        }
        lastEl = li;
        li.setAttribute("draggable", true);
        const { title, isCompleted } = t.getInfo();
        li.innerHTML = isCompleted ? "completed " : "process " + title;
        li.onclick = () => {
          t.toggle();
          this.render();
        };
        li.ondragstart = () => {
          moveTask = t;
        };
      });
      if (lastEl)
        while ((oldEl = lastEl.nextElementSibling)) {
          this.task.removeChild(oldEl);
          this.taskEl.push(oldEl);
        }
    }
  }
};

new DOMRenderer(document.querySelector("main"), new App());
