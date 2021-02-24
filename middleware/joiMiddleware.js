const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({error: error.message});
        next();
    }
}

module.exports = { validate };
