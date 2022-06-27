# Maps<a id='maps'></a>

## Map (Project)
A map is the equivalent of projects in some apps (not to confuse with DesignSafe Projects).
They are the basic unit of work.

When creating a new map, the user is required to save the map to a location in DesignSafe.
If saved in the Data Depot, the user creating the map will be the sole owner of the map with edit capabilities (import, delete, rename, etc).
Otherwise, if saved to a DesignSafe project location, the users of the project will also have the right to edit the map.

If saved to a DesignSafe project, the DesignSafe project interface will also show this association.

<figure><img src="../img/designsafe-save.png" alt="" style="filter:drop-shadow(2px 2px 3px black); width:100%"><figcaption style="padding-top: 20px" align = "center"><b>Fig 3.1</b></figcaption></figure>

## Public Map
An owner of a map can create a "Public Map" by creating one in the Manage -> Public (tab) -> (icon) Make a public map.
The user can open the map by clicking on the generated link.
When clicking on the (icon) copy icon, the URL address of the public icon will be available.

A public map is meant to be a permanent link to the project unless the project itself is deleted.
Thus, one must be careful of deleting the underlying project after sharing a link to the map.

## Syncing Map<a id='syncing-map'></a>
If the user checks the "Sync Folder" checkbox on creating the map, the map will sync all the assets from the chosen save location.
So, all the assets will be imported. Whatever asset the user import to the location from DesignSafe will automatically be imported.

To check the discrepancies Hazmapper will start the import job periodically.

