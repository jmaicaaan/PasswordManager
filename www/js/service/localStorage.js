module.exports = localStorage;

function localStorage(){
    var $service = this;
    $service.items = [];
    $service.add = add;
    $service.populateServiceItems = populateServiceItems;
    $service.getByKey = getByKey;
    $service.remove = remove; //delete keyword is a reserved word.
    $service.update = update;

    function add(key, value){
        if(!key)
            throw 'Title input is empty.';
        
        if(hasDuplicate(key)){
            throw 'Title is already existing';
        }
        
        window.localStorage.setItem(key, value);
        populateServiceItems();
    }

    function getByKey(key){
        if(!key)
            throw 'No specified title';
        var item = window.localStorage.getItem(key) ? window.localStorage.getItem(key) : [];
        return item ;
    }

    function populateServiceItems(){
        var storage = window.localStorage,
            len = Object.keys(storage).length,
            keys = Object.keys(storage),
            items = [];

        for(var i = 0; i <= len - 1; i++){
            var item = JSON.parse($service.getByKey(keys[i]));
            items.push(item);
        }

        $service.items = items;
    }

    function remove(key){
        if(!key)
            throw 'No specified title';
        
        window.localStorage.removeItem(key);
        populateServiceItems();
    }

    function update(key, value){
        window.localStorage.setItem(key, value);
    }

    function hasDuplicate(key){
        return getByKey(key).length > 0 ? true : false;
    }
}