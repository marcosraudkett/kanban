import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem, CdkDrag } from '@angular/cdk/drag-drop';
import { ItemComponent } from '../../interfaces/item-component';
import { FormComponent } from '../../interfaces/form-component';
import { ElementDatabaseService } from '../../services/element-database.service'
import { FormDatabaseService } from '../../services/form-database.service'
import { CookieService } from '../../services/cookie.service'
import { cloneDeep } from 'lodash';

import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: [
    './main-view.component.scss'
  ],
  providers: [DatePipe]
})
export class MainViewComponent implements OnInit {
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  components: object[];
  isComponentsLoaded: boolean = false;
  component : object;
  componentTitle: string = '';
  properties: [];
  activeProperty: string;
  hierarchyItems: [];
  todo: string[];
  template ="Template";
  boardMain = "Board";
  componentsTitle = "Components";
  itemPrompt: string;
  idForBoard: number;
  i:number;
  id: number;
  idList=[];

  workspaceTitle = "FlowCatalyst"
  workspaceTitleFull = "FlowCatalyst"
  formTitle: string;
  formId: string;
  formData: object[];
  lockerVisible: boolean = true;
  lastSavedVisible: boolean = false;
  lastSaved: string;
  selectFormTitles = [];
  openFormDropdown: string;
  exportFormat: string;
  autoSaveInterval: number = 30000;
  autoSaveIntervalDraft: number = 30;
  autoSave: boolean = true;
  //componentsVisible: boolean = false;

  isNewModalActive: boolean = false;
  isOpenModalActive: boolean = false;
  isExportModalActive: boolean = false;
  isSettingsModalActive: boolean = false;
  isDeleteFormModalActive: boolean = false;

  

  constructor(
    private elementDataBase: ElementDatabaseService, 
    private formDataBase: FormDatabaseService, 
    public Cookies: CookieService, 
    private datePipe: DatePipe,
    public _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.loadForms();

    this.loadSettings();

    this.selectFormTitles = [];

    /* if form id cookie exists then we attempt to load the form */
    this.formId = this.Cookies.getCookie("form_id");
    if(this.formId && this.formId != '') {
      this.loadForm(this.formId);
    }

    if(!!this.autoSave == true)
    {
      setInterval(
        () => {
          console.log(this.autoSaveInterval);
          this.saveForm();
      }, this.autoSaveInterval)
    }

  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
    else {
            console.log(" board: ",this.board);
            const clone = cloneDeep(event.previousContainer.data[event.previousIndex]);
            var newId = Math.floor(Math.random() * Math.floor(20000));
            clone['id'] = newId;
            this.checkId(clone);

            console.log(newId);
            setTimeout(
              () => {
              this.loadProperties(newId, event);
            }, 50)
                  
            

    // Add the clone to the new array.
           event.container.data.splice(event.currentIndex, 0, clone);
      
    }
    //this.loadProperties(id:number, item: event);
    this.refreshHierarchy();
  }

  dropHierarchy(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
  }
  noReturnPredicate() {
    return false;
  }

  
  board = [
    
  ]; 

  


  editItem(item:ItemComponent): void{
    
    item.editing=true;
    
   
  }

  deleteItem(id:number){
    console.log("deleting id: "+id);
    this.board = this.board.filter(board=>board.id!==id);
    delete this.idList[this.board[id]];
    this.refreshProperties();
    this.refreshHierarchy();
  }

  getElements(): void {
    this.components = this.elementDataBase.getElements();
    //console.log(this.components +" components");
  }

  destroyElements(): void {
    this.components.length = 0;
    this.isComponentsLoaded = false;
  }

  checkId(clone:any): void{
    if(this.idList.includes(clone['id'])){
      clone['id']= Math.floor(Math.random()*Math.floor(2000));
     
     
    }
    if(this.idList.includes(clone['id']))
    this.checkId(clone);
    
    this.idList.push(clone['id']);
    
    
  }

  /* for loading properties */
  loadProperties(id:number, item: CdkDragDrop<string[]>, event) {
    this.properties = [];
    this.component = this.board.filter(
          board => board.id === id);
    this.componentTitle = this.component[0]['title'];
    this.activeProperty = this.component[0]['_id']; 
    this.id = id;
    
    for (let obj of this.component) {
        for (let key in obj) {
          if(key != '_id' 
             && key != 'create_date' 
             && key != 'editing' 
             && key != 'main')
          {
            this.properties.push(
              { title: key, value: obj[key] }
            )
          }
        }
    }
    
    console.log("loadProperties: " + this.component);
  }

  /* saves the board item settings 
  @@TODO: check for clone id here
  */
  saveProperties() {
    this.component = this.board.filter(
          board => board.id === this.id);
    for (let obj of this.component) {
        for (let key in obj) {
          if(key != '_id' 
             && key != 'create_date' 
             && key != 'editing' 
             && key != 'main')
          {
            this.component[0][key] = (<HTMLInputElement>document.getElementById(key)).value;
          }
        }
    }
    this.notification("Properties saved.", "", 2000);
    this.refreshHierarchy();
  }

  /**
   * refreshes the hierarchy 
   * 
   */ 
  refreshHierarchy() {
    this.hierarchyItems = [];
    for(this.i=0; this.i<this.board.length;this.i++){
      this.hierarchyItems.push(
        {
          title:this.board[this.i]['title'],
          id:this.board[this.i]['id'],
          default:this.board[this.i]['default']
        }
      )
    }
  }

  /**
   * refreshes the properties 
   * 
   */ 
  refreshProperties() {
    if(this.board.length != 0)
    {
      this.id = this.board[0]['id'];
      this.loadProperties(this.id);
    } else {
      this.properties = [];
      this.componentTitle = null;
    }
  }

  closeProperties() {
    this.properties = [];
    this.componentTitle = null;
  }

  /**
   * called after creating or opening a form.
   * 
   */ 
  initializeWorkspace() {
    var newDate = new Date();
    if (this.isComponentsLoaded == false) {
        this.getElements();
        this.isComponentsLoaded = true;
    } 
    this.closeNewFormModal();
    this.formTitle = "";
    this.lockerVisible = false;
    this.lastSavedVisible = true;
    this.lastSaved = "Saved. (Today "+ this.datePipe.transform(newDate, 'HH:mm') +")";
    this.loadForms();
    this.refreshHierarchy();
    //this.componentsVisible = true;
  }

  /* can be called after deleteForm or deleteActiveForm (hides workspace) */
  destroyWorkspace() {
    this.destroyElements();
    this.closeDeleteFormModal();
    this.lockerVisible = true;
    this.lastSavedVisible = false;
    this.workspaceTitle = "FlowCatalyst";
    this.workspaceTitleFull = "FlowCatalyst";
    this.loadForms();
  }

  loadSettings(): void {
    this.autoSave = this.Cookies.getCookie("autoSave");
    this.autoSaveInterval = this.Cookies.getCookie("autoSaveInterval");
    this.autoSaveIntervalDraft = this.Cookies.getCookie("autoSaveInterval") / 1000;
  }

  saveSettings(): void {
    this.Cookies.setCookie("autoSave", <any>this.autoSave, 1, "/");
    this.Cookies.setCookie("autoSaveInterval", parseInt(this.autoSaveIntervalDraft) * 1000, 1, "/");
    this.autoSave = this.Cookies.getCookie("autoSave");
    this.autoSaveInterval = this.Cookies.getCookie("autoSaveInterval");
    console.log(this.Cookies.getCookie("autoSaveInterval"));
    console.log(this.Cookies.getCookie("autoSave"));
    this.toggleSettingsModal();
    this.notification("Settings saved.", "", 2000);
  }

  closeForm(): void {
    this.Cookies.deleteCookie("form_id");
    this.destroyWorkspace();
  }

  /**
   * Delete currently active form via Delete form modal
   * 
   */ 
  deleteActiveForm(): void {
    this.formId = this.Cookies.getCookie("form_id");
    this.formDataBase.deleteForm(this.formId).then((data:any) => {
      if(data)
      {
        this.destroyWorkspace();
        this.Cookies.deleteCookie("form_id");
        this.closeDeleteFormModal();
      }
    });
  }

  /**
   * Loads all forms
   * 
   */ 
  loadForms(): void {
    this.selectFormTitles = [];
    this.formDataBase.loadForms().then((data:any) => {
      if(data)
      {
        for(this.i=0; this.i<data['data'].length;this.i++){
          this.selectFormTitles.push(
            {title: data['data'][this.i]['title'],id: data['data'][this.i]['_id']}
          )
        }
        this.refreshHierarchy();
      }
    });
  }

  /**
   * Save form
   * Gets the currently open form via cookie form_id and saves it to the database.
   * 
   */ 
  saveForm(): void {
    this.formId = this.Cookies.getCookie("form_id");
    this.formData = JSON.stringify(this.board);
    if(this.formId) {
      this.formDataBase.saveForm(this.formId,this.formData).then((data:any) => {
        if(data)
        {
          let newDate = new Date();
          console.log("Saved. at: " + this.datePipe.transform(newDate, 'HH:mm'));
          this.lastSaved = "Saved. (Today "+ this.datePipe.transform(newDate, 'HH:mm') +")";
          this.notification("Form saved.", "", 2000);
        }
      });
    }
  }

  /**
   * Loads form data (board contents) and updates current board contents
   * 
   */ 
  loadFormData(formId): void {
    this.formDataBase.loadFormData(formId).then((data:any) => {
      if(data)
      {
        let re = /\'/gi;
        this.formData = data['data'][0]['formData'].replace(re, '"');
        if(this.formData !== 'empty')
        {
          this.formData = JSON.parse(this.formData);
          this.board = this.formData;
          console.log(this.board);
          if(this.board.length != 0)
          { 
            this.id = this.board[0]['id'];
            this.loadProperties(this.id);
          } else {
            this.closeProperties();
          }
        } else {
          this.closeProperties();
          this.board = [];
        }
        this.refreshHierarchy();
      }
    });
  }

  /**
   * Open form via Open form modal (selects form id from the dropdownlist)
   * 
   */ 
  openForm(): void {
    this.formDataBase.loadForm(this.openFormDropdown).then((data:any) => {
      if(data)
      {
        this.formTitle = data['data']['title'];
        this.workspaceTitle = data['data']['title'];
        this.workspaceTitleFull = data['data']['title'];
        this.workspaceTitle.length >= 15 ? this.workspaceTitle = this.workspaceTitle.substr(0, 15) + '...' : this.workspaceTitle = this.workspaceTitle;
        this.Cookies.setCookie("form_id", this.openFormDropdown, 1, "/");
        this.loadFormData(this.openFormDropdown);
        this.initializeWorkspace();
        this.closeOpenFormModal();
        this.refreshHierarchy();
      }
    });
  }

  /**
   * For loading previously created forms
   * 
   */ 
  loadForm(formId): void {
    this.formDataBase.loadForm(this.formId).then((data:any) => {
      if(data)
      {
        this.formTitle = data['data']['title'];
        this.workspaceTitle = data['data']['title'];
        this.workspaceTitleFull = data['data']['title'];
        this.workspaceTitle.length >= 15 ? this.workspaceTitle = this.workspaceTitle.substr(0, 15) + '...' : this.workspaceTitle = this.workspaceTitle;
        this.Cookies.setCookie("form_id", this.formId, 1, "/");
        this.loadFormData(this.formId);
        this.initializeWorkspace();
      }
    });
  }
  
  /**
   * Create a new form
   * 
   */ 
  createForm(): void {
    this.formId = this.formDataBase.newForm(this.formTitle).then((data:any) => {
    setTimeout(
      () => {
      if(this.formId)
      {
        this.formId = data['data']['_id'];
        this.formTitle = data['data']['title'];
        this.workspaceTitle = data['data']['title'];
        this.workspaceTitleFull = data['data']['title'];
        this.workspaceTitle.length >= 15 ? this.workspaceTitle = this.workspaceTitle.substr(0, 15) + '...' : this.workspaceTitle = this.workspaceTitle;
        this.board = [];
        /* setcookie to remember the form id */
        this.Cookies.setCookie("form_id", this.formId, 1, "/");
        this.initializeWorkspace();
      }
    });
    }, 2500)
  }

  /**
   * Export form
   * 
   */ 
  exportForm(): void {
    if(this.exportFormat == 'json')
    {  
      this.dyanmicDownloadByHtmlTag({
        fileName: this.workspaceTitleFull + '.json',
        text: JSON.stringify(this.board)
      });
    }
    if(this.exportFormat == 'xml')
    {  
      /* add XML download here */
    }
  }

  /**
   * JSON download
   * 
   */ 
  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  notification(message: string, action: string, duration: number): void {
      this._snackBar.open(message, action, {
        duration: duration,
      });
  }

  closeNewFormModal() {
    this.isNewModalActive = false;
  }

  toggleDeleteFormModal() {
    this.isDeleteFormModalActive = false;
  }

  closeOpenFormModal() {
    this.isOpenModalActive = false;
  }

  closeDeleteFormModal() {
    this.isDeleteFormModalActive = false;
  }

  toggleNewFormModal() {
    this.isNewModalActive = !this.isNewModalActive;
  }

  toggleOpenFormModal() {
    this.isOpenModalActive = !this.isOpenModalActive;
  }

  toggleExportFormModal() {
    this.isExportModalActive = !this.isExportModalActive;
  }

  toggleDeleteFormModal() {
    this.isDeleteFormModalActive = !this.isDeleteFormModalActive;
  }

  toggleSettingsModal() {
    this.isSettingsModalActive = !this.isSettingsModalActive;
  }

}
