from datetime import datetime, timedelta
from functools import wraps
from django.db import connection
from django.http import JsonResponse
import jwt
from ldap3 import Server, Connection, ALL


#----tokeAuthorizeMethod------
def IsAuthorizeModuleForRole(roleId,moduleCode,functioncode):

    with connection.cursor() as cursor:
        try:
            print(roleId,moduleCode,functioncode)
            cursor.execute('SP_AuthorizedModuleForRole @roleId=%s,@moduleCode=%s,@functioncode=%s', [roleId, moduleCode, functioncode])

            result = cursor.fetchone()

            return {'MsgFlag': result[0], 'Msg': result[1]}

        except Exception as e:
            print(f"Error executing stored procedure: {str(e)}")
            return ["0", f"Error executing stored procedure: {str(e)}"]



#---- CreateTokenMethod------
SECRET_KEY = "j@y@n!t@"
def token_required(muduleCode, functioncode):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'MsgFlag': 0, 'Msg': 'Missing token'}, status=401)

            try:
                decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                print("decoded_token",decoded_token)
                expiration_time = datetime.fromtimestamp(decoded_token['exp'])
                print("expiration_time",expiration_time)
                RoleId = decoded_token['RoleId']
                print("RoleId",RoleId)
                current_time = datetime.now() + timedelta(minutes=330)
                print("current_time",current_time)
                if expiration_time < current_time:
                    return JsonResponse({'MsgFlag': 0, 'Msg': 'Token has expired'}, status=401)

                modulePermission = IsAuthorizeModuleForRole(RoleId, muduleCode, functioncode)


                if muduleCode != '' and modulePermission.get('MsgFlag') == 0:
                    return JsonResponse({'Msg': modulePermission.get('Msg'), 'MsgFlag': modulePermission.get('MsgFlag')}, status=401)

            except jwt.ExpiredSignatureError:
                return JsonResponse({'MsgFlag': 0, 'Msg': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'MsgFlag': 0, 'Msg': 'Invalid token'}, status=401)
            except Exception:
                return JsonResponse({'MsgFlag': 0, 'Msg': 'An error occurred while processing the token'}, status=401)

            return view_func(request, *args, **kwargs)

        return wrapped_view

    return decorator




#-----ActiveDirectory(AD)Connection-------
def authenticate_ldap(username, password):
    ad_server = 'ldap://JAYANITA.jayanita.net'
    ad_domain = 'JAYANITA.com'
    ad_user_base_dn = 'OU=Users,DC=JAYANITA,DC=com'  # Adjust this based on your AD structure

    # Construct the full user DN
    user_dn = f"CN={username},{ad_user_base_dn}"
    # Set up the LDAP server and connection
    server = Server(ad_server, get_info=ALL)
    connection = Connection(server, user=f"{username}@{ad_domain}", password=password, auto_bind=True)

    # Check if the authentication was successful
    if connection.bind():
        print(f"Authentication successful for user: {username}")
        connection.unbind()
        return True
    else:
        print(f"Authentication failed for user: {username}")
        connection.unbind()
        return False

