import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления бронированием уроков'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'POST':
            data = json.loads(event.get('body', '{}'))
            name = data.get('name')
            email = data.get('email')
            phone = data.get('phone')
            booking_date = data.get('date')
            booking_time = data.get('time')
            
            if not all([name, email, phone, booking_date, booking_time]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Все поля обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                '''INSERT INTO bookings (name, email, phone, booking_date, booking_time, status)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
                (name, email, phone, booking_date, booking_time, 'pending')
            )
            booking_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': booking_id, 'message': 'Бронирование создано'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            date_filter = query_params.get('date')
            
            if date_filter:
                cur.execute(
                    '''SELECT id, name, email, phone, booking_date, booking_time, status, created_at
                       FROM bookings WHERE booking_date = %s ORDER BY booking_time''',
                    (date_filter,)
                )
            else:
                cur.execute(
                    '''SELECT id, name, email, phone, booking_date, booking_time, status, created_at
                       FROM bookings ORDER BY booking_date DESC, booking_time DESC LIMIT 100'''
                )
            
            rows = cur.fetchall()
            bookings = []
            for row in rows:
                bookings.append({
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'phone': row[3],
                    'date': row[4].isoformat() if row[4] else None,
                    'time': row[5],
                    'status': row[6],
                    'createdAt': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'bookings': bookings}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            booking_id = data.get('id')
            status = data.get('status')
            
            if not booking_id or not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID и статус обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                '''UPDATE bookings SET status = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s''',
                (status, booking_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Статус обновлен'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
