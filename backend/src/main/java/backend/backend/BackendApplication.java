package backend.backend;

import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Properties;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(BackendApplication.class);



		 Properties properties = new Properties();
        
        // Cloud Database Routing (Forces the correct clean address string)
        properties.setProperty("spring.datasource.url", "jdbc:postgresql://://render.com");
        properties.setProperty("spring.datasource.username", "db_user");
        properties.setProperty("spring.datasource.password", "WnKf5mzJULP4VyFkGbXz4oJdvcy3z4Eu");
        properties.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
        
        // Hibernate & Service Controls
        properties.setProperty("spring.jpa.hibernate.ddl-auto", "update");
        properties.setProperty("spring.jpa.show-sql", "false");
        properties.setProperty("spring.flyway.enabled", "false");
        
        // Redis & App Tokens
        properties.setProperty("spring.data.redis.url", "redis://red-daik2vgae00c73erdq50:6379");
        properties.setProperty("jwt.secret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        properties.setProperty("jwt.expiration-ms", "86400000");
        properties.setProperty("app.base-url", "http://localhost:8080");
        
        app.setDefaultProperties(properties);
        app.run(args);
	}

}
