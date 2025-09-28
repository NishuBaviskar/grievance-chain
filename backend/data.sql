-- This file contains the clean starting data for the application.
-- It only includes INSERT statements and matches the schema.sql file perfectly.

-- Insert Users
INSERT INTO `users` (`id`, `user_id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'S001', 'Alice Johnson', 'alice@example.com', '$2a$12$81yyJvefdAzj9Vnq0mxnmeexKY3rTMJeR7lYEaK0EujWicMBMzDWu', 'student', '2025-09-10 11:40:35'),
(2, 'S002', 'Charlie Brown', 'charlie@example.com', '$2a$12$81yyJvefdAzj9Vnq0mxnmeexKY3rTMJeR7lYEaK0EujWicMBMzDWu', 'student', '2025-09-10 11:40:35'),
(3, 'A001', 'Bob Williams', 'bob@example.com', '$2a$12$81yyJvefdAzj9Vnq0mxnmeexKY3rTMJeR7lYEaK0EujWicMBMzDWu', 'admin', '2025-09-10 11:40:35');

-- Insert Complaints
-- <<< THE FIX: A value for the 'sentiment' column is now correctly included in each row >>>
INSERT INTO `complaints` (`id`, `complaint_id_bc`, `user_id_fk`, `title`, `category`, `ipfs_hash`, `status`, `sentiment`, `created_at_bc`, `updated_at_bc`) VALUES
(1, 2, 1, 'docs', 'Academic', 'QmSmd292VSMjMJ3tGvH1hVy4CRWaoAyvYh6w2PNeeTwnHo', 'Rejected', 'Neutral', 1757504499, 1757505429),
(2, 3, 1, 'Hostel rooms are not cleaned regularly, and hygiene is poor in bathrooms', 'Hostel', 'QmTksjN9aKH6obMuj5MZGTt3wL68D1eFea5Qsr97dqGwyW', 'Resolved', 'Negative', 1757505190, 1757505485),
(3, 4, 1, 'Wi-Fi in the campus is very slow and unreliable, especially during online classes', 'Infrastructure', 'Qmc3HJdgWrLw4hksdEDjAJtBx64seHPmWfre7JJdd6uw1S', 'Acknowledged', 'Negative', 1757505241, 1757505493),
(4, 5, 1, 'The professor shows favoritism during internal assessments and practical evaluations', 'Faculty', 'QmVMZShnt6xk5Za9SQs5Y7KSgp3Dz5Agj1T9RnCHx7BWep', 'Under Investigation', 'Negative', 1757505279, 1757505535),
(5, 6, 1, 'The exam timetable is not well planned, with multiple exams scheduled on the same day.', 'Academic', 'QmSBNFoBPJBnpe7gqNgX2uCNbFqx6Pwa3Y6WUbQ3nyF64b', 'Not Processed', 'Negative', 1757505403, 1757505403);

-- Insert Complaint Transactions
INSERT INTO `complaint_transactions` (`id`, `complaint_id_fk`, `action_type`, `transaction_hash`, `status_to`, `created_at`) VALUES
(1, 1, 'CREATE_CONFIRMED', '0xc6d66d8086e9c026fe1fdad81eab3de085791cbbd74a1cc7758cb1eeab26f614', 'Not Processed', '2025-09-10 11:41:39'),
(2, 1, 'STATUS_UPDATE_CONFIRMED', '0xf97a3443288087414319ae746fc44e578197df073155bfe40d8011f71a3cdae1', 'Acknowledged', '2025-09-10 11:50:22'),
(3, 2, 'CREATE_CONFIRMED', '0x6c76fcfdf4e603b168c1cadb3b1e9efe756baed7f1945915d3e486a51692db7b', 'Not Processed', '2025-09-10 11:53:10'),
(4, 3, 'CREATE_CONFIRMED', '0xfc94c313ae3c419f8533932bb3d62ef7848bc355d60f17074f9291911c19e9d0', 'Not Processed', '2025-09-10 11:54:01'),
(5, 4, 'CREATE_CONFIRMED', '0xec4ce69c44c798bcb17fac8d17982bf8cfeca804a18c5340a174b8dc1fbce3a4', 'Not Processed', '2025-09-10 11:54:39'),
(6, 5, 'CREATE_CONFIRMED', '0x9cf109a6142b34ef16fee413bf8bbca4169d4c876be96c05c644d36a2ee564e5', 'Not Processed', '2025-09-10 11:56:43'),
(7, 1, 'STATUS_UPDATE_CONFIRMED', '0x032fc5491c272d836a4424bca6ea907485b2c30c082af0327dc979e8251a3846', 'Rejected', '2025-09-10 11:57:09'),
(8, 2, 'STATUS_UPDATE_CONFIRMED', '0xd91e8bba37b6f0a136f6738fb33575eed039ee29b978c4f72a8ec6735a02c168', 'Acknowledged', '2025-09-10 11:57:21'),
(9, 2, 'STATUS_UPDATE_CONFIRMED', '0xbabf32e98323bfc37517dfb007a2c4cfd765b4d92a3b4924fadc3ce65f4d1f65', 'Under Investigation', '2025-09-10 11:57:34'),
(10, 2, 'STATUS_UPDATE_CONFIRMED', '0xb4c5b1682354e326d9ffa6da9cc26cfb28c1feab914ad2b4f6b5fe84c1fbb16c', 'Pending Committee Review', '2025-09-10 11:57:54'),
(11, 2, 'STATUS_UPDATE_CONFIRMED', '0xbe2e91694b593a34d0f7bfc19becaa9d41cb4d58504132e099b35768f93de611', 'Resolved', '2025-09-10 11:58:06'),
(12, 3, 'STATUS_UPDATE_CONFIRMED', '0xb6a868133c7f71a40c72fcbd10ede321210dc8635c4df808c923c94e7a12dc0c', 'Acknowledged', '2025-09-10 11:58:14'),
(13, 4, 'STATUS_UPDATE_CONFIRMED', '0x1e3a8cd9bf93800602f12da2a2549b5f2c221db3138b94801e88b6f3ba1bb81f', 'Acknowledged', '2025-09-10 11:58:54'),
(14, 4, 'STATUS_UPDATE_CONFIRMED', '0x8dc793c69e0501f16848cdf42b7833e9d63a79e5dc0e19a023bc65feb66911f7', 'Under Investigation', '2025-09-10 11:58:58');