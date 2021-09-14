import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  nombre = "Allan";
  private numero = 20;

  getNumero(){
    return this.numero;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
