import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { MatterportSDKWrapperService } from '../services/matterport-sdk-wrapper.service';
import { DataService } from '../services/data.service';
import { MatterportViewComponent } from '../matterport-view/matterport-view.component';
import { MatterportModelService } from '../services/matterport-model.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TagId } from '../models/TagId';

@Component({
    selector: 'app-matterport-frame',
    templateUrl: './matterport-frame.component.html',
    styleUrls: ['./matterport-frame.component.scss']
    
})
export class MatterportFrameComponent implements OnInit,OnDestroy{
    @ViewChild('showCaseEmbed', { static: true })
    showCaseElement!: ElementRef<HTMLIFrameElement>;
    @ViewChild("inputText", { static: true }) 
    inputTextElement!: ElementRef<HTMLInputElement>;
    
    url :string = '';

    @Output() init = new EventEmitter<HTMLIFrameElement>();
    @Input() mpsdk:any;
    @Input() message:string | undefined;

    modelUrl!: string;
    private onDestroy$ = new Subject();
    selectedTagId?: TagId;
    hoveredTagId?: TagId;
    

    container = document.querySelector('.showcase_container');
     addTagBtn = document.querySelector('.add_tag');
    removeBtn = document.querySelector('.remove_tags');
     tag:any;
     s:any;
      addingTag = false;
      movingTag = false;
      oldTagSids:any;
      i:any;
     isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        //isnotFirefox:any=!this.isFirefox ;

        constructor(
            private matterportSdk: MatterportSDKWrapperService,
            private matterportModel: MatterportModelService,
            private data:DataService
        ) {}
    
        async ngOnInit(): Promise<void> {
            // Matterportの表示
            this.modelUrl = this.matterportModel.getViewUrl();
          
           //console.log('zzz'+this.modelUrl);
           //console.log("111"+this.showCaseElement.nativeElement);
           
        }
    
        
        // openForm(num:any){
	
        //     console.log('in form');
        //        var form= document.getElementById("myForm")as HTMLElement;
        //        form.style.display="block";
                
        //        this.inputTextElement.nativeElement.value=num;
        //         //console.log('accessing:'+);
                
        //     }
        /**
         * Matterportの初期表示が完了した際の処理
         * @param embed Matterportが表示されているiframe要素
         *
         * SDKの初期化やイベントの検知を行う。
         */
         async onFrameInit(embed:HTMLIFrameElement): Promise<void> {
            await this.matterportSdk.initialize(embed);
            this.matterportSdk
                .listenClickEvent()
                .pipe(takeUntil(this.onDestroy$))
                .subscribe((id) => {
                    this.selectedTagId = id;
                    console.log("clickid:"+this.selectedTagId.value);
                });
            this.matterportSdk
                .listenHoverEvent()
                .pipe(takeUntil(this.onDestroy$))
                .subscribe(({ id, hovering }) => {
                    this.hoveredTagId = hovering ? id : undefined;
                });
    
                this.mpsdk=this.matterportSdk.sdk;
                var modelData;
                this.mpsdk.Model.getData()
                    .then(function(model:any) {
                        modelData = model;
                        //console.log("--------"+model);
                        //console.log(mpSdk.Model.getData());
                        console.log("yes"+'mpSdk.Model.getData()',JSON.stringify(model,null,2));
                    }).catch(function(error:any) {
                        //c('mpSdk.Model.getData()', 'Failed: ' + error);
                    }
                );

                this.mpsdk.on(this.mpsdk.Mattertag.Event.CLICK,
                    (tagSid: string) =>{
                        console.log('mpSdk.on(Sdk.Mattertag.Event.CLICK)', 'Selected: ' + tagSid, true);
                        console.log('noo'+ this.mpsdk.Mattertag.getData())
                        this.mpsdk.Mattertag.getData()
                        .then(function(mattertags:any) {
                          $.each(mattertags, function(key:any,mattertag:any) {
                              if (mattertag.sid == tagSid) {
                              //console.log("label"+'mpSdk.Mattertag.Label.getData()');
                                  //console.log("sid"+'selectionSID');
                                  
                                  console.log('mpSdk.Mattertag.getData()(filtered by ' + tagSid + ')', JSON.stringify(mattertag,null,2));
                                  var obj=JSON.parse(JSON.stringify(mattertag,null,2));
                                  console.log("first element"+obj["label"]);
                                   this.openForm(obj["label"]);
                                  console.log("opening the form");
                              }
                          });
                        })
                        .catch(function(error:any) {
                          console.log('mpSdk.on(Sdk.Mattertag.Event.CLICK)', 'Failed: ' + error, true);
                        });			
                  });
                 
                 

                 //console.log("abc", this.mpsdk);
                
        }
    
         
        
        ngOnDestroy(): void {
            this.onDestroy$.next();
        }

     btnclicked=false;
     ss :any=[];
     
    matframe():void{
    this.showCaseElement.nativeElement.src = this.modelUrl;
    this.init.emit(this.showCaseElement.nativeElement)
   
    var y= document.getElementById("add")as HTMLButtonElement;
    y.style.display="block";
     var z=document.getElementById("rmv")as HTMLButtonElement;
     z.style.display="block";

     this.onFrameInit(this.showCaseElement.nativeElement);

    
     this.btnclicked=true;
     //this.loadedShowcaseHandler();
    }
 
  
    loadedShowcaseHandler(){
        
        console.log('hello');
        this.fetchtags();
        this.focusDetect();
        this.intersection();
        this.addbutton();

    }

     placeTag(){
        console.log("hello")
            if(this.tag) this.mpsdk.Mattertag.navigateToTag(this.tag, this.mpsdk.Mattertag.Transition.INSTANT);
            this.tag = null;
            this.movingTag = false;
        }
        
       
        //  if(!this.isFirefox){
        //      this.focusDetect();
        //  }
    
       
         focusDetect(){
            console.log('in focus')

            let lf=this;
            const eventListener = window.addEventListener('blur', function() {
                if (document.activeElement === lf.showCaseElement.nativeElement) {
                    lf.placeTag(); //function you want to call on click
                    setTimeout(function(){ window.focus(); }, 0);
                }
               // window.removeEventListener('blur', eventListener );
            });
        }
    
         overlayDetect(){
            console.log('in overlay function')

             let rf=this;
            if(this.tag){
                const overlay = document.createElement('div');
                overlay.setAttribute('class', 'click-overlay');
                overlay.addEventListener('mousemove', e => {
                    this.mpsdk.Renderer.getWorldPositionData({
                        x: e.clientX - 30,
                        y: e.clientY - 5
                    })
                    .then((data: { position: any; }) =>{
                        rf.updateTagPos(data.position,0,0); 
                    })
                    .catch((e: any) => {
                        console.error(e);
                        rf.placeTag();
                    });
                    
                });
                overlay.addEventListener('click', e => {
                    rf.placeTag();
                    overlay.remove();
                });
                //this.container.insertAdjacentElement('beforeend', overlay);
            }
        }
    
         updateTagPos(newPos:any, newNorm:any, scale:any){
            if(!newPos) return;
            if(!scale) scale = .33;
            if(!newNorm) newNorm = {x: 0, y: 1, z: 0};
    
            this.mpsdk.Mattertag.editPosition(this.tag, {
                anchorPosition: newPos,
                stemVector: {
                    x: scale * newNorm.x,
                    y: scale * newNorm.y,
                    z: scale * newNorm.z,
                }
            })
            .catch((e: any) =>{
                console.error(e);
                this.tag = null;
                this.movingTag = false;
            });
        }
    
        intersection(){
            console.log('in intersection');

            let mf=this;

        this.mpsdk.Pointer.intersection.subscribe((intersectionData: { object: string; position: any; normal: any; }) => {
            if(this.tag && !this.movingTag){
                if(intersectionData.object === 'intersectedobject.model' || intersectionData.object === 'intersectedobject.sweep'){
                    mf.updateTagPos(intersectionData.position, intersectionData.normal,0);
                }
            }
        });
        }

        addbutton(){
       
            console.log('in add function')
            if(!this.addingTag && !this.tag){
                this.addingTag = true;
                this.mpsdk.Mattertag.add([{
                    label: "Matterport Tag",
                    description: "",
                    anchorPosition: {x: 0, y: 0, z: 0},
                    stemVector: {x:0, y: 0, z: 0},
                    color: {r: 1, g: 0, b: 0},
                }])
                .then((sid: any[]) => {
                    this.tag = sid[0];
                    return this.mpsdk.Mattertag.getData();
                })
                .then( (collection: any[]) => {
                    const t_sid = collection.find( elem => elem.sid === this.tag);
                    //const row = addToTable(t_sid);
                    //addTagListeners(row);
                    this.addingTag = false;
                })
                .then(() => {
                    if(this.isFirefox) this.overlayDetect();
                })
                .catch( (e: any) => {
                    console.error(e);
                    this.addingTag = false;
                })
            }
       
    }
   
    fetchtags(){
        console.log('in fetch ')
        
        this.mpsdk.Mattertag.getData()
        .then( (tags:any) => {
            const mattertags = tags;
            //populateTags(tags);
            //setupTagFunctionality();
        })
    }
    
       
     
       
    
        //to remove all the tags
    
         removeAllTags(){
            this.mpsdk.Mattertag.getData()
            .then((tags: any[]) => {
                return tags.map(tag => tag.sid);
            })
            .then((tagSids: any) => {
                return this.mpsdk.Mattertag.remove(tagSids)
            })
            .catch(console.error);
    
            // document.querySelectorAll('tr').forEach( block =>{
            //     if(!block || block.children[0].tagName == 'TH') return;
            //     block.parentNode.removeChild(block);
            // });
        }
    
        closeForm(){
            var form=document.getElementById("myForm")as HTMLElement;
            form.style.display="none";
        }
        

    //console.log('hello')

    
//}
    
}



 function openForm(num:any){
	
     console.log('in form');
        var form= document.getElementById("myForm")as HTMLElement;
        form.style.display="block";
        
        var ip=document.getElementById('last0')as HTMLElement;
        ip.value=num;
         //inputTextElement.nati
         //console.log('accessing:'+);
        
     }

