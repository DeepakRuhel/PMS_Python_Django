from django.urls import path

from .auth import token_required
from .views import (login,
                    control,
                    menu,
                    Module,
                    Role,
                    Function,
                    Space,
                    Role_Permission,
                    Stage,
                    Users,
                    ModuleCategory,
                    SpaceList,
                    SpaceListStage,
                    Template,
                    TemplateDetails,
                    LookUp,
                    DynamicFieldsForTaskListStage,
                    Task,
                    ProjectTaskDynamicField,
                    SpaceAndListMenu,
                    Activity,
                    TaskAtribute,
                    CustomFields,
                    StageUser,
                    CustomeStageMoves,
                    TemplateTasks,
                    StageUser,
                    Login, layout, view_module_category, view_module, view_Control, view_Function, view_Stage,
                    view_Space, view_List, view_ListStage, view_ListStageUser, view_Role, view_Template,
                    view_TemplateDetail, view_User, dashbord, selectStage, ListStageUser, RolePermission,
                    CreateCustomeFields, spacelistTask)

urlpatterns = [
#---loginAPI---
    path('api/Users/login', login.login_user, name='login_user'),

#---MenuAPI---
    path('api/Users/ModuleRight/',  token_required(muduleCode='', functioncode='V') (menu.CategoryModuleRightData), name='CategoryModuleRightData'),
    path('api/Users/ModuleAction/', token_required(muduleCode='', functioncode='V')(menu.ModuleActionData), name='ModuleActionData'),

#---ControlsAPI---
path('Controls/',control.GetControlData, name='GetControlData'),
path('AddControls/', control.addControlData, name='addControlData'),
    path('api/Controls/',              token_required(muduleCode='CNT', functioncode='V')(control.GetControlData), name='GetControlData'),
    path('api/Controls/AddControls',   token_required(muduleCode='CNT', functioncode='A')(control.addControlData), name='addControlData'),
    path('api/Controls/UpdateControls',token_required(muduleCode='CNT', functioncode='A')(control.addControlData), name='addControlData'),

#---ModuleAPI---
path('Module/',Module.GetModuleData, name='GetModuleData'),
path('AddModules/',Module.addModuleData, name='addModuleData'),
    path('api/Module/',               token_required(muduleCode='MOD', functioncode='V')(Module.GetModuleData), name='GetModuleData'),
    path('api/Module/AddModules',     token_required(muduleCode='MOD', functioncode='A')(Module.addModuleData), name='addModuleData'),
    path('api/Module/UpdateModules',  token_required(muduleCode='MOD', functioncode='E')(Module.addModuleData), name='addModuleData'),

#---RolesAPI---
path('Roles/',Role.GetRoleData, name='GetRoleData'),
path('AddRoles/', Role.addRoleData, name='addRoleData'),
    path('api/Roles/',              token_required(muduleCode='RLS', functioncode='V')(Role.GetRoleData), name='GetRoleData'),
    path('api/Roles/AddRoles',      token_required(muduleCode='RLS', functioncode='A')(Role.addRoleData), name='addRoleData'),
    path('api/Roles/UpdateRoles',   token_required(muduleCode='RLS', functioncode='E')(Role.addRoleData), name='addRoleData'),

#---FunctionAPI---
path('Function/', Function.GetFunctionData, name='GetFunctionData'),
path('AddFunctions/',Function.addFunctionData, name='addFunctionData'),
    path('api/Function/',               token_required(muduleCode='FUN', functioncode='V')(Function.GetFunctionData), name='GetFunctionData'),
    path('api/Function/AddFunctions',   token_required(muduleCode='FUN', functioncode='A')(Function.addFunctionData), name='addFunctionData'),
    path('api/Function/UpdateFunctions',token_required(muduleCode='FUN', functioncode='E')(Function.addFunctionData), name='addFunctionData'),

#---SpacesAPI---
path('Spaces/',Space.GetSpaceData, name='GetSpaceData'),
path('Add_UpdateSpaces/',Space.addSpaceData,name='addSpaceData'),
    path('api/Spaces/',                token_required(muduleCode='SPC', functioncode='V')(Space.GetSpaceData), name='GetSpaceData'),
    path('api/Spaces/Add_UpdateSpaces',token_required(muduleCode='SPC', functioncode='A')(Space.addSpaceData), name='addSpaceData'),
    path('api/Spaces/UpdateSpaces',    token_required(muduleCode='SPC', functioncode='E')(Space.addSpaceData), name='addSpaceData'),

#---RolePrmsionAPI---
path('api/RolePrmsion',  Role_Permission.GetRolePermissionData, name='GetRolePermissionData'),
path('api/RolesPermissions/updateRolePermissons',Role_Permission.addRolePermissionData, name='addRolePermissionData'),
    path('api/RolesPermissions/InsertUpdateRolePermissons',token_required(muduleCode='ROLEPERM', functioncode='A')(Role_Permission.addRolePermissionData), name='addRolePermissionData'),

#---StagesAPI---
path('Stages/', Stage.GetStageData, name='GetStageData'),
path('AddStages/',Stage.addStageData, name='GetStageData'),
    path('api/Stages/',             token_required(muduleCode='STG', functioncode='V')(Stage.GetStageData), name='GetStageData'),
    path('api/Stages/AddStages',    token_required(muduleCode='STG', functioncode='A')(Stage.addStageData), name='GetStageData'),
    path('api/Stages/UpdateStages', token_required(muduleCode='STG', functioncode='E')(Stage.addStageData), name='GetStageData'),

#---UsersAPI---------
path('Users/', Users.GetUserData, name='GetUserData'),
path('AddUsers/', Users.addUserData, name='GetUserData'),
    path('api/Users/addUsers',      token_required(muduleCode='USR', functioncode='A')(Users.addUserData), name='addUserData'),
    path('api/Users/UpdateUsers',   token_required(muduleCode='USR', functioncode='E')(Users.addUserData), name='addUserData'),

#---MCategoryAPI---
path('MCategory/', ModuleCategory.GetModuleCategoryData, name='GetModuleCategoryData'),
path('AddMCategory/',ModuleCategory.addModuleCategoryData, name='GetModuleCategoryData'),
    path('api/MCategory/',                      token_required(muduleCode='MDC', functioncode='V')(ModuleCategory.GetModuleCategoryData), name='GetModuleCategoryData'),
    path('api/MCategory/AddModuleCategory',     token_required(muduleCode='MDC', functioncode='A')(ModuleCategory.addModuleCategoryData), name='addModuleCategoryData'),
    path('api/MCategory/UpdateModuleCategory',  token_required(muduleCode='MDC', functioncode='E')(ModuleCategory.addModuleCategoryData), name='addModuleCategoryData'),

#---SpaceListsAPI---
path('SpaceLists/', SpaceList.GetSpaceListData, name='GetSpaceListData'),
path('AddEditSpaceLists/',SpaceList.addSpaceListData, name='addSpaceListData'),
    path('api/SpaceLists/',                token_required(muduleCode='SPLST', functioncode='V')(SpaceList.GetSpaceListData), name='GetSpaceListData'),
    path('api/SpaceLists/AddSpaceLists',   token_required(muduleCode='SPLST', functioncode='A')(SpaceList.addSpaceListData), name='addSpaceListData'),
    path('api/SpaceLists/UpdateSpaceLists',token_required(muduleCode='SPLST', functioncode='E')(SpaceList.addSpaceListData), name='addSpaceListData'),

#---SpaceListStageAPI------
path('SpcLstStg/', SpaceListStage.GetSpaceListStageData, name='GetSpaceListStageData'),
path('AddEditSpcLstStg/',SpaceListStage.addSpaceListStageData, name='GetSpaceListStageData'),
path('EditSpcLstStg/',SpaceListStage.EditSpaceListStageData, name='GetSpaceListStageData'),
    path('api/SpcLstStg/',               token_required(muduleCode='SPLSTSTG', functioncode='V')(SpaceListStage.GetSpaceListStageData), name='GetSpaceListStageData'),
    path('api/SpcLstStg/AddSpcLstStg',   token_required(muduleCode='SPLSTSTG', functioncode='A')(SpaceListStage.addSpaceListStageData), name='addSpaceListStageData'),
    path('api/SpcLstStg/UpdateSpcLstStg',token_required(muduleCode='SPLSTSTG', functioncode='E')(SpaceListStage.addSpaceListStageData), name='addSpaceListStageData'),

#---TemplateAPI------
path('Template/', Template.GetTemplateData, name='GetTemplateData'),
path('AddTemplates/', Template.addTemplateData, name='addTemplateData'),
path('UpdateTemplates/', Template.UpdateTemplateData, name='addTemplateData'),
    path('api/Template/',               token_required(muduleCode='TPLT', functioncode='V')(Template.GetTemplateData), name='GetTemplateData'),
    path('api/Template/AddTemplates',   token_required(muduleCode='TPLT', functioncode='A')(Template.addTemplateData), name='addTemplateData'),
    path('api/Template/UpdateTemplates',token_required(muduleCode='TPLT', functioncode='E')(Template.addTemplateData), name='addTemplateData'),

#---TemplateDetailsAPI------
path('TpltDtls/', TemplateDetails.GetTemplateDetailsData, name='GetTemplateDetailsData'),
path('AddTpltDtls/',TemplateDetails.addTemplateDetailsData, name='addTemplateDetailsData'),
path('UpdateTpltDtls/',TemplateDetails.UpdateTemplateDetailsData, name='addTemplateDetailsData'),
    path('api/TpltDtls/',               token_required(muduleCode='TPLTDTL', functioncode='V')(TemplateDetails.GetTemplateDetailsData), name='GetTemplateDetailsData'),
    path('api/TpltDtls/AddTpltDtls',    token_required(muduleCode='TPLTDTL', functioncode='A')(TemplateDetails.addTemplateDetailsData), name='addTemplateDetailsData'),
    path('api/TpltDtls/UpdateTpltDtls', token_required(muduleCode='TPLTDTL', functioncode='E')(TemplateDetails.addTemplateDetailsData), name='addTemplateDetailsData'),

#---LookupAPI------
path('LookupData/', LookUp.GetLookUpData, name='GetLookUpData'),
    path('api/Lookup/LookupData/',      token_required(muduleCode='', functioncode='V')(LookUp.GetLookUpData), name='GetLookUpData'),

#---DynamicFieldsForTaskListStageAPI------
    path('api/DFFTLS/',                 token_required(muduleCode='', functioncode='V')(DynamicFieldsForTaskListStage.GetDynamicFieldsForTaskListStageData), name='GetDynamicFieldsForTaskListStageData'),

#---TaskAPI------
    path('api/PrjktTask/',              token_required(muduleCode='', functioncode='V')(Task.GetTaskData), name='GetTaskData'),
    path('api/PrjktTask/AddPrjTaskH',   token_required(muduleCode='', functioncode='A')(Task.addTaskData), name='addTaskData'),
    path('api/PrjktTask/UpdatePrjTaskH',token_required(muduleCode='', functioncode='E')(Task.addTaskData), name='addTaskData'),

#---Project Task Dynamic Field API------
    path('api/PrjktTskDtl/AddProjectTD',   token_required(muduleCode='', functioncode='A')(ProjectTaskDynamicField.addProjectTaskDynamicField), name='addProjectTaskDynamicField'),
    path('api/PrjktTskDtl/UpdateProjectTD',token_required(muduleCode='', functioncode='E')(ProjectTaskDynamicField.addProjectTaskDynamicField), name='addProjectTaskDynamicField'),

#---SpaceAndListMenuAPI------
    path('api/Spc&ListMenu/',       token_required(muduleCode='SPLSTSTG', functioncode='V')(SpaceAndListMenu.GetSpaceAndListMenuData), name='GetSpaceAndListMenuData'),

#---ActivityAPI------
    path('api/ActivityData/',       token_required(muduleCode='ActChat', functioncode='V')(Activity.GetActivityData), name='GetActivityData'),
    path('api/AddActivity/',        token_required(muduleCode='ActChat', functioncode='A')(Activity.addActivitys), name='addActivitys'),


#---Update_TaskAtribute API------
    path('api/UpdatTskAtr',       token_required(muduleCode='ActChat', functioncode='V')(TaskAtribute.Update_TaskAtribute), name='GetActivityData'),


#---ListCustomeFieldsAndDataAPI------
    path('api/ListCustomeFields/',       token_required(muduleCode='CNT', functioncode='V')(CustomFields.GetListCustomeFieldsData), name='GetListCustomeFieldsData'),
    path('api/InsertListCustomeFields',  token_required(muduleCode='CNT', functioncode='A')(CustomFields.addListCustomeFieldsData), name='addListCustomeFieldsData'),
    path('api/UpdateListCustomeFields',  token_required(muduleCode='CNT', functioncode='E')(CustomFields.addListCustomeFieldsData), name='addListCustomeFieldsData'),

    path('api/GetCustomeTblData/',   token_required(muduleCode='CNT', functioncode='V')(CustomFields.GetCustomeTblData), name='GetCustomeTblData'),
    path('api/InsertCustomTblData',  token_required(muduleCode='CNT', functioncode='A')(CustomFields.addCustomeTblData), name='addCustomeTblData'),
    path('api/UpdateCustomTblData',  token_required(muduleCode='CNT', functioncode='E')(CustomFields.addCustomeTblData), name='addCustomeTblData'),


#---StageUserAPI------
path('StageUsers/',StageUser.GetStageUserData,name='GetStageUserData'),
path('AddStageUsers/',StageUser.addStageUserData, name='addStageUserData'),
    path('api/StageUsers/',         token_required(muduleCode='CNT', functioncode='V')(StageUser.GetStageUserData), name='GetStageUserData'),
    path('api/InsertStageUsers',    token_required(muduleCode='CNT', functioncode='A')(StageUser.addStageUserData), name='addStageUserData'),
    path('api/UpdateStageUsers',    token_required(muduleCode='CNT', functioncode='E')(StageUser.addStageUserData), name='addStageUserData'),

#---UpdateCustomeStageMoves API-----
    path('api/UpdateCustomeStageMoves',    token_required(muduleCode='CNT', functioncode='E')(CustomeStageMoves.UpdateCustomeStageMoves), name='addStageUserData'),

#---TemplateTasksAPI------
    path('api/TemplateTasksData/',  token_required(muduleCode='STG', functioncode='V')(TemplateTasks.GetTemplateTasksData), name='GetTemplateTasksData'),
    path('api/AddTemplateTasks',  token_required(muduleCode='STG', functioncode='V')(TemplateTasks.addTemplateTasksData), name='GetTemplateTasksData'),
    path('api/UpdateTemplateTasks',  token_required(muduleCode='STG', functioncode='V')(TemplateTasks.addTemplateTasksData), name='GetTemplateTasksData'),


#-------LyoutPage--------
   path('', Login, name='Login'),
   path('logout', Login, name='Login'),
   path('dashbord', dashbord, name='dashbord'),
   path('Layout', layout, name='Layout'),
   path('module-category', view_module_category, name='view_module_category'),
   path('modules',view_module , name='view_module'),
   path('controls',view_Control , name='view_Control'),
   path('function',view_Function , name='view_Function'),
   path('stages',view_Stage , name='view_Stage'),
   path('spaces',view_Space , name='view_Space'),
   path('sub-space',view_List , name='view_List'),
   path('sub-space-stage',view_ListStage , name='view_ListStage'),
   path('view_ListStageUser',view_ListStageUser, name='view_ListStageUser'),
   path('roles',view_Role , name='view_Role'),
   path('users',view_User , name='view_User'),
   path('templates',view_Template , name='view_Template'),
   path('all-template-detail',view_TemplateDetail , name='view_TemplateDetail'),
   path('selectStage',selectStage , name='selectStage'),
   path('ListStageUser',ListStageUser , name='ListStageUser'),
   path('role-permission',RolePermission , name='RolePermission'),
   path('customFields',CreateCustomeFields , name='customFields'),
   path('spacelistTask',spacelistTask , name='spacelistTask'),
]