import json
import bcrypt
import jwt
from django.db import connection
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .auth import (token_required, authenticate_ldap)
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt


#---Login_Apo----
class login:
    @csrf_exempt
    def login_user(request):
        try:
            SECRET_KEY = "j@y@n!t@"
            expiration_time = datetime.now() + timedelta(hours=24)
            algorithm = "HS256"

            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)

            with connection.cursor() as cursor:
                cursor.execute("EXEC SP_IsValidateUser @jsonData=%s", [json_data])
                row = cursor.fetchone()
                user_data = dict(zip([col[0] for col in cursor.description], row))

            if row is not None:
                if user_data.get('IsUserLDAP') == 0:
                    # Validate the password using bcrypt
                    hashed_password = user_data.get('Password', '')
                    provided_password = InputVal.get('password', '')

                    # Passwords match, create JWT token
                    if bcrypt.checkpw(provided_password.encode('utf-8'), hashed_password.encode('utf-8')):
                        token = jwt.encode({'exp': expiration_time, 'RoleId': user_data.get('RoleId')}, SECRET_KEY,
                                           algorithm)

                        if user_data.get('MsgFlag') == 1:
                            return JsonResponse({
                                'token': token,
                                'expiresIn': expiration_time.strftime("%Y-%m-%d %I:%M:%S %p %Z"),
                                'id': user_data.get('Id'),
                                'userId': InputVal.get('userId'),
                                'name': user_data.get('Name'),
                                'roleId': user_data.get('RoleId'),
                                'roleName': user_data.get('RoleName'),
                                'userImage': user_data.get('UserImagePath'),
                            }, status=200)
                        else:
                            return JsonResponse({'MsgFlag': user_data.get('MsgFlag'), 'Msg': user_data.get('Msg')},
                                                status=500)
                    else:
                        return JsonResponse({'MsgFlag': 0, 'Msg': 'Invalid Credentials'}, status=500)
                else:
                    # LDAP authentication
                    if authenticate_ldap(InputVal.get('userId'), InputVal.get('password')):
                        print("LDAP authentication successful!")

                        token = jwt.encode({'exp': expiration_time, 'RoleId': user_data.get('RoleId')}, SECRET_KEY,
                                           algorithm)
                        if user_data.get('MsgFlag') == 1:
                            return JsonResponse({
                                'token': token,
                                'expiresIn': expiration_time.strftime("%Y-%m-%d %I:%M:%S %p %Z"),
                                'id': user_data.get('Id'),
                                'userId': InputVal.get('userId'),
                                'name': user_data.get('Name'),
                                'roleId': user_data.get('RoleId'),
                                'roleName': user_data.get('RoleName'),
                                'userImage': user_data.get('UserImagePath'),
                            }, status=200)
                        else:
                            return JsonResponse({'MsgFlag': user_data.get('MsgFlag'), 'Msg': user_data.get('Msg')},
                                                status=500)
                    else:
                        return JsonResponse({'MsgFlag': 0, 'Msg': 'LDAP Authentication Failed'}, status=500)
            else:
                return JsonResponse({'MsgFlag': 0, 'Msg': 'Error validating user'}, status=500)
        except jwt.ExpiredSignatureError:
            # Handle token expiration
            return JsonResponse({'MsgFlag': 0, 'Msg': 'Token has expired, Please Loging Again..!!'}, status=401)
        except Exception as e:
            error_message = f"Error: {type(e).__name__} - {str(e)}"
            print(f"Error in login: {error_message}")
            return JsonResponse({'MsgFlag': 0, 'Msg': error_message}, status=500)


#---Menu_Api------
class menu:
    def  CategoryModuleRightData(request):
        with connection.cursor() as cursor:
            userId = request.GET.get('userId')
            # Call your stored procedure
            cursor.execute("EXEC SP_GetMenuesForUser_PY @userId=%s", [userId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    def ModuleActionData(request):
        with connection.cursor() as cursor:
            roleId = request.GET.get('roleId')  # You can specify a default value if not provided
            moduleId = request.GET.get('moduleId')
            # Call your stored procedure
            cursor.execute("EXEC SP_GetModuleFunctionsForRole_PY @roleId=%s, @moduleId=%s", [roleId, moduleId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)


#---Control_Api------
class control:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='CNT', functioncode='V')
    def GetControlData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchControlsData_PY")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='MDC', functioncode='V')
    def addControlData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateControls @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data,status=500)
        except Exception as e:
            response_data={"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data,status=500)


#---Module_Api------
class Module:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='MOD', functioncode='V')
    def GetModuleData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchModulesData_PY")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='MOD', functioncode='E')
    def addModuleData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateModules @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data,status=500)
        except Exception as e:
            response_data={"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data,status=500)


#---Role_Api------

class Role:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='RLS', functioncode='V')
    def GetRoleData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC SP_FatchRolesData_py")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='RLS', functioncode='A')
    def addRoleData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateRoles @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---Function_Api------
class Function:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='FUN', functioncode='V')
    def GetFunctionData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchFunctionsData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='FUN', functioncode='E')
    def addFunctionData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateFunctions @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---Space_Api------
class Space:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPC', functioncode='V')
    def GetSpaceData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchSpacesData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPC', functioncode='A')
    def addSpaceData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateSpaces @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---Role_Permission_Api------
class Role_Permission:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='ROLEPERM', functioncode='V')
    def GetRolePermissionData(request):
        with connection.cursor() as cursor:
            roleId = request.GET.get('roleId')
            # Call your stored procedure
            cursor.execute("EXEC SP_GetRoleModuleFunctions @roleId=%s", [roleId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='ROLEPERM', functioncode='A')
    def addRolePermissionData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateRolePermissons @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---Stage_Api------
class Stage:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='STG', functioncode='V')
    def GetStageData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchStagesData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='STG', functioncode='A')
    def addStageData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateStages @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---User_Api------
class Users:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='USR', functioncode='V')
    def GetUserData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchUsersData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='USR', functioncode='V')
    def addUserData(request):
        try:
            # Function to hash the password
            def hash_password(password):
                # Generate a salt and hash the password
                salt = bcrypt.gensalt()
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
                return hashed_password.decode('utf-8')

            data = json.loads(request.body)

            # Hash the password before inserting into the database
            data['password'] = hash_password(data['password'])


            json_data = json.dumps(data)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateUsers @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---ModuleCategory_Api------
class ModuleCategory:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='MDC', functioncode='V')
    def GetModuleCategoryData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchModuleCategoryData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='MDC', functioncode='A')
    def addModuleCategoryData(request):
        if request.method == 'POST':
            try:
                InputVal = json.loads(request.body)
                json_data = json.dumps(InputVal)
                with connection.cursor() as cursor:
                    cursor.execute("EXEC InsertUpdateModuleCategory @jsonData=%s", [json_data])
                    result = cursor.fetchone()
                    print(result)
                    print(result[0])
                    if result[0] == 1:
                        response_data = {"MsgFlag": result[0], "Msg": result[1]}
                        return JsonResponse(response_data, status=200)
                    else:
                        response_data = {"MsgFlag": result[0], "Msg": result[1]}
                        return JsonResponse(response_data, status=500)
            except Exception as e:
                response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
                return JsonResponse(response_data, status=500)
        else:
            return JsonResponse({"MsgFlag": 0, "Msg": "Method not allowed"}, status=405)


#---SpaceList_Api------
class SpaceList:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPLST', functioncode='V')
    def GetSpaceListData(request):
        with connection.cursor() as cursor:
            SpaceId = request.GET.get('SpaceId')
            id = request.GET.get('id')
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchSpaceListsData @SpaceId=%s,@id=%s",[SpaceId,id])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPLST', functioncode='A')
    def addSpaceListData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateSpaceLists @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---SpaceListStage_Api------
class SpaceListStage:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPLSTSTG', functioncode='V')
    def GetSpaceListStageData(request):
        with connection.cursor() as cursor:
            spaceListId = request.GET.get('spaceListId')
            spaceListStageId = request.GET.get('spaceListStageId')
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchSpaceListStagesData @spaceListId=%s,@spaceListStageId=%s",
                           [spaceListId, spaceListStageId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPLSTSTG', functioncode='A')
    def addSpaceListStageData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateSpaceListStages @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='SPLSTSTG', functioncode='E')
    def EditSpaceListStageData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateSpaceListStages @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

#---Template_Api------

class Template:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLT', functioncode='V')
    def GetTemplateData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchTemplatesData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLT', functioncode='A')
    def addTemplateData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateTemplates @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLT', functioncode='E')
    def UpdateTemplateData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateTemplates @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---TemplateDetails------
class TemplateDetails:
    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLTDTL', functioncode='V')
    def GetTemplateDetailsData(request):
        with connection.cursor() as cursor:
            templateId = request.GET.get('templateId')  # You can specify a default value if not provided
            templatedetailId = request.GET.get('templatedetailId')
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchTemplateDetailsData @templateId=%s, @templatedetailId=%s",[templateId, templatedetailId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLTDTL', functioncode='A')
    def addTemplateDetailsData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateTemplateDetails @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

    @staticmethod
    @csrf_exempt
    @token_required(muduleCode='TPLTDTL', functioncode='E')
    def UpdateTemplateDetailsData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateTemplateDetails @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---LookUp_Api------
class LookUp:
    def GetLookUpData(request):
        with connection.cursor() as cursor:
            type = request.GET.get('type')
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchLookupsData @type=%s", [type])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)



#---DynamicFieldsForTaskListStage_Api------
class DynamicFieldsForTaskListStage:
    def GetDynamicFieldsForTaskListStageData(request):
        with connection.cursor() as cursor:
            SpaceListId = request.GET.get('SpaceListId')
            StageId = request.GET.get('StageId')
            ProjectTaskHeaderId = request.GET.get('ProjectTaskHeaderId')
            # Call your stored procedure
            print("hi")
            cursor.execute(
                "EXEC SP_GetDynamicFieldsForTaskListStage @SpaceListId=%s, @StageId=%s, @ProjectTaskHeaderId=%s",
                [SpaceListId, StageId, ProjectTaskHeaderId])
            print("hi")
            # Fetch the result
            result = cursor.fetchone()
            print("hi")
            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)



#---Task_Api------
class Task:
    def GetTaskData(request):
        with connection.cursor() as cursor:
            SpaceListId = request.GET.get('SpaceListId')
            TaskId = request.GET.get('TaskId')
            ProjectId = request.GET.get('ProjectId')
            dataType = request.GET.get('dataType')
            # Call your stored procedure
            cursor.execute("EXEC sp_FatchProjectTaskHeader @SpaceListId=%s, @TaskId=%s, @ProjectId=%s , @dataType=%s",
                           [SpaceListId, TaskId, ProjectId, dataType])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addTaskData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateProjectTaskHeader @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---ProjectTaskDynamicFieldApi------
class ProjectTaskDynamicField:

    @csrf_exempt
    def addProjectTaskDynamicField(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateProjectTaskDynamicField @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1],"ProjectTaskDetailsId":result[2],"ProjectTaskHeaderId":result[3]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---Space&ListMenu_Api------
class SpaceAndListMenu:
    def GetSpaceAndListMenuData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("SP_GetSpaceAndListMenu_PY")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'


            try:
                # Convert the JSON string to a Python object
                controls_data = json.loads(json_value)
            except json.JSONDecodeError:
                controls_data = []

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)



#---Activity_Api------
class Activity:
    def GetActivityData(request):
        with connection.cursor() as cursor:
            TaskId = request.GET.get('TaskId')
            StageId = request.GET.get('StageId')

            # Call your stored procedure
            cursor.execute("EXEC sp_FatchActivityData @TaskId=%s, @StageId=%s", [TaskId, StageId])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addActivitys(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateActivities @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

#-----Update_TaskAtribute API-------
class TaskAtribute:
    @csrf_exempt
    def Update_TaskAtribute(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC Update_TaskAtribute @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1],"ProjectTaskHeaderId": result[2],"ProjectTaskHeadername":result[3],"ProjectTaskHeaderStageId":result[4],"ProjectTaskHeaderCreatedBy":result[5]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---CustomFields_Api------
class CustomFields:
    def GetListCustomeFieldsData(request):
        with connection.cursor() as cursor:
            SpaceListId = request.GET.get('SpaceListId')
            Id = request.GET.get('Id')

            # Call your stored procedure
            cursor.execute("EXEC SP_FatchListCustomFieldsData @SpaceListId=%s, @Id=%s", [SpaceListId, Id])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addListCustomeFieldsData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateListCustomeFields @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1], "Id":result[2]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

    def GetCustomeTblData(request):
        with connection.cursor() as cursor:
            SpaceListId = request.GET.get('SpaceListId')
            Id = request.GET.get('Id')

            # Call your stored procedure
            cursor.execute("EXEC SP_GetCustomeTblData @SpaceListId=%s, @Id=%s",[SpaceListId,Id])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addCustomeTblData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateCustomTblData @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1], "Id":result[2]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)

#---StageUser_Api------
class StageUser:
    def GetStageUserData(request):
        with connection.cursor() as cursor:
            SpaceListId = request.GET.get('SpaceListId')
            StageId = request.GET.get('StageId')
            Id = request.GET.get('Id')

            # Call your stored procedure
            cursor.execute("EXEC sp_FatchStageUser  @SpaceListId=%s,@StageId=%s, @Id=%s", [SpaceListId, StageId, Id])

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addStageUserData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateStageUsers @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1], "Id":result[2]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#------CustomeStageMoves api----
class CustomeStageMoves:
    @csrf_exempt
    def UpdateCustomeStageMoves(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC UpdateCustomeStageMoves @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#---TemplateTasks_Api------
class TemplateTasks:
    def GetTemplateTasksData(request):
        with connection.cursor() as cursor:
            # Call your stored procedure
            cursor.execute("sp_FatchTemplateTasksData")

            # Fetch the result
            result = cursor.fetchone()

            # Process the result as needed
            json_value = result[0] if result else '[]'

            # Convert the JSON string to a Python object
            controls_data = json.loads(json_value)

            # Create a formatted response with dynamic keys and values
            formatted_response = [
                {key: item[key] for key in item.keys()}
                for item in controls_data
            ]
        return JsonResponse(formatted_response, safe=False)

    @csrf_exempt
    def addTemplateTasksData(request):
        try:
            InputVal = json.loads(request.body)
            json_data = json.dumps(InputVal)
            with connection.cursor() as cursor:
                cursor.execute("EXEC InsertUpdateTemplateTasks @jsonData=%s", [json_data])
                result = cursor.fetchone()
                print(result)
                print(result[0])
                if result[0] == 1:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {"MsgFlag": result[0], "Msg": result[1]}
                    return JsonResponse(response_data, status=500)
        except Exception as e:
            response_data = {"MsgFlag": 0, "Msg": f"Error: {str(e)}"}
            return JsonResponse(response_data, status=500)


#-----------------------------call Tempaltes---------------
def Login(request):
    return render(request,"login.html")

def layout(request):
    print("hii....")
    return render(request,"Layout.html")

def view_module_category(request):
    return render(request,"viewModuleCategory.html")

def view_module(request):
    return render(request,"ViewModule.html")

def view_Control(request):
    return render(request,"ViewControl.html")

def view_Function(request):
    return render(request,"ViewFunction.html")

def view_Stage(request):
    return render(request,"ViewStage.html")


def view_Space(request):
    return render(request,"ViewSpace.html")

def view_List(request):
    return render(request,"ViewList.html")

def view_ListStage(request):
    return render(request,"ViewListStage.html")

def view_ListStageUser(request):
    return render(request,"ViewListStageUser.html")

def view_Role(request):
    return render(request,"ViewRole.html")

def view_User(request):
    return render(request,"Viewuser.html")

def view_Template(request):
    return render(request,"ViewTemplate.html")

def view_TemplateDetail(request):
    return render(request,"ViewTemplateDetail.html")

def dashbord(request):
    return render(request,"dashbord.html")

def selectStage(request):
    return render(request,"SelectStage.html")

def ListStageUser(request):
    return render(request,"ViewListStageUser.html")

def RolePermission(request):
    return render(request,"RolePermission.html")

def CreateCustomeFields(request):
    return render(request,"CreateFeild.html")

def spacelistTask(request):

    return render(request, "OTR.html")

