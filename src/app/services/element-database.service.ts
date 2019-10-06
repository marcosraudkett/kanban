import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ItemComponent } from '../interfaces/item-component';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';


const endpoint = 'http://node.marcosraudkett.com:8083/api/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    

  })
};

@Injectable({
  providedIn: 'root'
})

export class ElementDatabaseService {

  elements: object[];
  components: object[];
  board: ItemComponent[];
  i: number;


  private extractData(res: Response) {
   
    let body = res;
    
    return body || { };
  }
  
  getElementsAPI(): Observable<any> {
    return this.http.get(endpoint + 'elements').pipe(
      map(this.extractData));
  }
  
  constructor(private http: HttpClient) { 
   
    this.components = [
      
    ];
    this.board = [
      
    ]; 
  
  }
    

  getElements(): any{
    
    this.elements = [];
    this.getElementsAPI().subscribe((data: {}) => {
    console.log("DataMessage: ");
    console.log(data);
    this.elements = data['data'];
     // restComponents = data.data;
    console.log(this.elements)
     for(this.i=0; this.i<this.elements.length;this.i++){
      this.components.push(
        this.elements[this.i]
      )
     }
    console.log("Board: ");
    console.log(this.components)
   
  
    });
    return this.components;
  }

}

