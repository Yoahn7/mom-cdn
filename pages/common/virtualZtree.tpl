{{if length<=2}}
    {{each rows as item ind}}
        {{if ind == 0}}
             <li data-id="{{item.id}}">
                <span class="button roots_docu"></span>
                <a href="javascript:;" title="{{item[filedName]}}" class="{{item[active]==0?'':'active'}}">
                    <span class="button ico_docu"></span>
                    <span class="node-name" title="{{item[filedName]}}">{{item[filedName]}}</span>
                </a>
            </li>
            {{else}}
            <li data-id="{{item.id}}">
            <span>{{item[active]==0?'a':'b'}}</span>
                <span class="button bottom_docu"></span>
                <a href="javascript:;" title="{{item[filedName]}}" class="{{item[active]==0?'':'active'}}">
                    <span class="button ico_docu"></span>
                    <span class="node-name" title="{{item[filedName]}}">{{item[filedName]}}</span>
                </a>
            </li>
        {{/if}}
    {{/each}}
{{else if (length>2)}}
    {{each rows as item ind}}
        <span>{{item[filedName]}}</span>
        {{if ind == 0}}
             <li data-id="{{item.id}}">
             <span>{{item[active]?'active':''}}</span>
                <span class="button roots_docu"></span>
                <a href="javascript:;" title="{{item[filedName]}}" class="{{item[active]==0?'':'active'}}">
                    <span class="button ico_docu"></span>
                    <span class="node-name" title="{{item[filedName]}}">{{item[filedName]}}</span>
                </a>
            </li>
            {{else if (ind == (length-1))}}
                <li data-id="{{item.id}}">
                    <span class="button bottom_docu"></span>
                    <a href="javascript:;" title="{{item[filedName]}}" class="{{item[active]==0?'':'active'}}">
                        <span class="button ico_docu"></span>
                        <span class="node-name" title="{{item[filedName]}}">{{item[filedName]}}</span>
                    </a>
                </li>
              {{else}}
                <li data-id="{{item.id}}">
                    <span class="button center_docu"></span>
                    <a href="javascript:;" title="{{item[filedName]}}" class="{{item[active]==0?'':'active'}}">
                        <span class="button ico_docu"></span>
                        <span class="node-name" title="{{item[filedName]}}">{{item[filedName]}}</span>
                    </a>
                </li>
        {{/if}}
    {{/each}}
{{/if}}
