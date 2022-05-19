const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

require("dotenv").config();

// Inscription
exports.signup = async (req, res) => {
    // Verifie que les champs sont remplis
    if (
        req.body.mail == null ||
        req.body.password == null ||
        req.body.username == null
    ) {
        return res.status(400).json({ error: "Merçi de remplir tout les champs correctement 🙏" });
    }
    // Verifie la taille du pseudo
    if (req.body.username.length <= 3 || req.body.username.length >= 14) {
        return res.status(400).json({ error: "Pseudonyme trop long ou trop court ❌" });
    }
    // Contrôle adresse email
    if (!EMAIL_REGEX.test(req.body.mail)) {
        return res.status(400).json({ error: "Email invalide ❌" });
    }
    if (req.body.username.length == 0) {
        return res.status(401).json({ error: "Pseudonyme requis ❌" });
    }
    const username = await User.findOne({
        attributes: ["mail"],
        where: { mail: req.body.mail },
    });
    // si l'utilisateur a un compte avec cet email
    if (username) {
        return res.status(401).json({ error: "Cet email est deja utilisé ❌" });
    } else {
        // Cryptage du mot de passe
        bcrypt.hash(req.body.password, 10)
            .then((hash) => {
                // Creer nouvel utilisateur
                User.create({
                    mail: req.body.mail,
                    password: hash,
                    username: req.body.username,
                })
                    .then(user => {
                        return res.status(201).json({
                            // Creation du token et envoi coté client
                            pseudo: user.username,
                            userID: user.id_user,
                            role: user.role,
                            token: jwt.sign(
                                { id_user: user.id_user, role: user.role },
                                process.env.SECRET,
                                { expiresIn: "1h" }
                            ),
                        });
                    })
                    .catch(err => {
                        return res.status(500).json({ error: err })
                    })
            });
    }
};

// Connexion
exports.login = async (req, res) => {
    const { mail, password } = req.body;
    const userFound = await User.findOne({ where: { mail: mail } });
    // Verifie que l'utilisateur existe avec l'adresse email
    if (!userFound) {
        res.status(404).json({ error: "Utilisateur introuvable 🧐" });
    } else {
        // Verification mot de passe
        bcrypt.compare(password, userFound.password).then(async (verify) => {
            if (!verify) {
                res.status(404).json({ error: "L'email ou le username est incorrect ❌" });
            }
            res.status(200).json({
                // Creation du token et envoi coté client
                role: userFound.role,
                pseudo: userFound.username,
                userID: userFound.id_user,
                token: jwt.sign(
                    { id_user: userFound.id_user, role: userFound.role },
                    process.env.SECRET,
                    { expiresIn: "1h" }
                ),
            });
        });
    }
};

// Trouve un User avec son id
exports.getOneUser = async (req, res, next) => {
    const userFound = await User.findOne({
        where: { id_user: req.params.id },
    });
    if (userFound) {
        res.status(200).json({
            user_id: userFound.id_user,
            mail: userFound.mail,
            poste: userFound.poste,
            bureau: userFound.bureau,
            username: userFound.username,
            date_crea: userFound.date_crea,
            avatar: process.env.img + userFound.avatar,
            // avatar:  userFound.avatar,
        });
    } else {
        res.status(404).json({ error: "Utilisateur introuvable 🧐" });
    }
};

// Modifier infos utilisateur
exports.updateUser = async (req, res) => {
    await User.findOne({ where: { id_user: req.params.id } }).then(
        (userFound) => {
            // Verifie que l'utilisateur existe
            if (!userFound) return res.status(404).json({ error: "Utilisateur introuvable 🧐" });
            // Acces autorisé admin ou utilisateur qui a créer le compte
            if (userFound.id_user == req.auth.userId || req.auth.role == 1) {
                // Mettre a jour les infos utilisateurs dans la base de donnée
                User.update(
                    {
                        mail: req.body.mail,
                        username: req.body.username,
                        poste: req.body.poste,
                        bureau: req.body.bureau,
                        // media:`${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
                    },
                    {
                        where: {
                            id_user: req.params.id,
                        },
                    }
                );
                return res.status(200).json(" Vos infos ont bien été prise en compte 😉");
            } else {
                return res.status(500).json({ error: "Requête non authorisée ⛔" });
            }
        }
    );
};

// Modifier MDP utilisateur
// module.exports.updatePassword = async (req, res) => {
//   await Utilisateur.findOne({ where: { id_user: req.params.id } }).then(
//     (userFound) => {
//       // Verifie que l'utilisateur existe
//       if (!userFound) return res.status(404).json({ error: "User not found" });
//       // Acces autorisé admin ou utilisateur qui a créer le compte
//       if (userFound.id_user == req.auth.userId || req.auth.role == 1) {
//         // Hachage du nouveau mot de passe
//         bcrypt.hash(req.body.password, 10).then((hash) => {
//           // Mettre a jour le mot de passe dans la base de donnée
//           Utilisateur.update(
//             {
//               password: hash,
//               date_mdp: new Date(),
//             },
//             {
//               where: { id_user: req.params.id },
//             }
//           );
//           return res.status(200).json(" Password update");
//         });
//       } else {
//         return res.status(500).json({ error: "Can't update Password" });
//       }
//     }
//   );
// };

// Modifier avatar d'un utilisateur
exports.updateAvatar = async (req, res) => {
    await User.findOne({ where: { id_user: req.params.id } })
        .then((userFound) => {
            // Verifie que l'utilisateur existe
            if (!userFound) return res.status(404).json({ error: "Utilisateur introuvable 🧐" });
            // Acces autorisé admin ou utilisateur qui a créer le compte
            if (userFound.id_user == req.auth.userId || req.auth.role == 1) {
                // Nom du fichier a supprimer
                // let filename = userFound.avatar.split("/images/")[1];
                // console.log(filename);
                if (userFound.avatar == "default.png") {
                    // Mettre à jour l'avatar en conservant img par default dans storage
                    User.update(
                        {
                            // avatar: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
                            avatar: req.file.filename,
                        },
                        { where: { id_user: req.params.id } }
                    );
                    return res.status(200).json("Avatar mis à jour 😊");
                } else {
                    // Supprimer image du dossier
                    console.log("file a supprime", userFound.avatar);
                    fs.unlink(`images/${userFound.avatar}/`, () => {
                        // Mettre à jour l'avatar
                        User.update(
                            {
                                // avatar: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
                                avatar: req.file.filename,
                            },
                            { where: { id_user: req.params.id } }
                        );
                        return res.status(200).json("Avatar mis à jour 😊");
                    });
                }
            } else {
                return res.status(500).json({ error: "Requête non authorisée ⛔" });
            }
        })
        .catch((err) => {
            console.log(err);
        });
};


// Supprimer un User
exports.deleteUser = async (req, res) => {
    await User.findOne({ where: { id_user: req.params.id } })
        .then(
            (userFound) => {
                // Verifie que l'utilisateur existe
                if (!userFound) return res.status(404).json({ error: "Utilisateur introuvable 🧐" });
                // Acces autorisé admin ou utilisateur qui a créer le compte
                if (userFound.id_user == req.auth.userId || req.auth.role == 1) {
                    // Nom du fichier a supprimer
                    if (userFound.avatar !== "default.png") {
                        // const filename = userFound.avatar.split("/images/")[1];
                        const filename = userFound.avatar
                        // Supprimer avatar du dossier
                        fs.unlink(`images/${filename}/`, () => {
                            // Supprimer l'utilisateur de la BDD
                            User.destroy({
                                where: {
                                    id_user: req.params.id,
                                },
                            });
                            res.status(201).json("Votre compte est supprimé 👋");
                        });
                    } else {
                        User.destroy({
                            where: {
                                id_user: req.params.id,
                            },
                        });
                        res.status(201).json("Votre compte est supprimé 👋");
                    }
                } else {
                    return res.status(401).json({ error: "Requête non authorisée ⛔" });
                }
            }
        ).catch(function (e) {
            console.error(e);
        })
};
module.exports.authentificate = (req, res, next) => {
    res.status(200).json({ message: "token valide !" })
};