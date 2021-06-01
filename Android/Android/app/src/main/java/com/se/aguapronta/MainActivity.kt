package com.se.aguapronta

import android.content.Intent
import android.os.Bundle
import android.text.TextUtils
import android.util.Log
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.ktx.Firebase
import com.se.aguapronta.databinding.ActivityMainBinding


class MainActivity : AppCompatActivity() {
    private  lateinit var binding: ActivityMainBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private var email = ""
    private var password = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //setContentView(R.layout.activity_main)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        // private lateinit var auth: FirebaseAuth
        // auth = Firebase.auth
        firebaseAuth = FirebaseAuth.getInstance()
        checkUser()

        binding.btnStart.setOnClickListener{
            //Toast.makeText(this, "Let's Begin!", Toast.LENGTH_SHORT).show()
            //val animation1 = AnimationUtils.loadAnimation(this, R.anim.scale_up)
            //val animation2 = AnimationUtils.loadAnimation(this, R.anim.scale_down)
            validateData()
            }
        }

    private fun checkUser() {
        val firebaseUser = firebaseAuth.currentUser
        if(firebaseUser != null){
            //user is already log
            val intent = Intent(this, SecondActivity::class.java)
            startActivity(intent)
            super.onBackPressed()
            //finish()
        }

    }

    private fun validateData() {
            //val editTextTextEmailAddress = findViewById(R.id.editTextTextEmailAddress) as EditText
            //val editTextTextPassword = findViewById(R.id.editTextTextPassword) as EditText
            email = binding.editTextTextEmailAddress.text.toString().trim()
            password = binding.editTextTextPassword.text.toString().trim()

            //validate
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.editTextTextEmailAddress.error = "Invalid email"
            } else if (TextUtils.isEmpty(password)) {
                binding.editTextTextPassword.error = "Please enter password"

            } else {//valid
                firebaseAuth.signInWithEmailAndPassword(email, password)
                    .addOnSuccessListener {
                        val intent = Intent(this, SecondActivity::class.java)
                        startActivity(intent)
                        finish()
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Try again!", Toast.LENGTH_SHORT)
                    }
            }

        }


}