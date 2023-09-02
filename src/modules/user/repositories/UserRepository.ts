import { pool } from '../../../mysql';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { sign }  from 'jsonwebtoken';
import { Request, Response } from 'express';



class UserRepository {
    create(request: Request, response: Response) {
        const { name, email, password } = request.body;
        pool.getConnection((err: any, connection: any) => {
            hash(password, 10, (err, hash) => {
                if (err) {
                    return response.status(500).json(err)
                }


                connection.query(
                    'INSERT INTO users (user_id, name, email, password) VALUES (?,?,?,?)',
                    [uuidv4(), name, email, hash],
                    (error: any, result: any, fileds: any) => {
                        connection.release();
                        if (error) {
                            return response.status(400).json(error)
                        }
                        response.status(200).json({ succes: true });
                    }
                )
            })
        })
    }


    login(request: Request, response: Response) {
        const { email, password } = request.body;
        pool.getConnection((err: any, connection: any) => {
            connection.query(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (error: any, results: any, fileds: any) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: 'Erro na sua autenticação!' })
                    }

                    compare(password, results[0].password, (err, result) => {
                        if (err) {
                            return response.status(400).json({ error: 'Erro na sua autenticação!' })
                        }

                        if (result) {
                            //jsonwuebtoken
                            const token = sign({
                                id: results[0].user_id,
                                email: results[0].email
                            }, 'segredo', { expiresIn: '1d' })

                            return response.status(200).json({ token: token })
                        }
                    })
                }
            )
        })
    }
}  




export { UserRepository };